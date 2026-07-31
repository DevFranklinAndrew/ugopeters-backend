import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import mongoose from "mongoose";
import envConfig from "../configurations/env.configuration";
import Post from "../models/post.model";

/** Shape of the frontend's static posts (see frontend/src/data/post.ts). */
type SeedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  featured?: boolean;
  author: string;
};

/**
 * Loads the frontend's static blog data (the source of truth for the initial
 * seed). It lives outside backend's rootDir and is an ESM module, so it can't be
 * `import`ed (tsc rootDir) or `require`d (ERR_REQUIRE_ESM). Instead we read it
 * as text and transpile it in-memory to CommonJS — the file is pure data with
 * no imports, so evaluating it standalone is safe.
 */
const loadFrontendPosts = (): SeedPost[] => {
  const file = path.resolve(__dirname, "../../../frontend/src/data/post.ts");
  const source = fs.readFileSync(file, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const shim = { exports: {} as { posts?: SeedPost[] } };
  new Function("exports", "module", "require", outputText)(
    shim.exports,
    shim,
    require,
  );

  if (!shim.exports.posts) {
    throw new Error("No `posts` export found in frontend/src/data/post.ts");
  }
  return shim.exports.posts;
};

const posts = loadFrontendPosts();

/**
 * Ports the existing frontend posts into MongoDB. Idempotent: a post whose slug
 * already exists is left untouched (skipped). The frontend `id` is dropped —
 * Mongo assigns its own `_id`. Run with `npm run seed:posts`.
 */
const seedPosts = async (): Promise<void> => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("[seed] Connected to MongoDB");

    let created = 0;
    let skipped = 0;

    for (const { id: _id, ...post } of posts) {
      const existing = await Post.findOne({ slug: post.slug }).select("_id");
      if (existing) {
        skipped += 1;
        continue;
      }

      await Post.create({ ...post, featured: post.featured ?? false });
      created += 1;
      console.log(`[seed] Created post: ${post.slug}`);
    }

    console.log(`[seed] Done. Created ${created}, skipped ${skipped}.`);
  } catch (error) {
    console.error(
      "[seed] Failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("[seed] Disconnected.");
  }
};

seedPosts();
