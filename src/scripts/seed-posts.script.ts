import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import mongoose from "mongoose";
import envConfig from "../configurations/env.configuration";
import Post from "../models/post.model";

/** Mirrors frontend/src/data/post.ts. */
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
 * The frontend's post data sits outside backend's rootDir and is ESM, so it can
 * be neither `import`ed (rootDir) nor `require`d (ERR_REQUIRE_ESM). Reading and
 * transpiling it in-memory is safe because the file is pure data, no imports.
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

/** `npm run seed:posts`. Idempotent — an existing slug is skipped, not updated. */
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

      // Seed data carries only a display date; derive publishedAt so seeded
      // posts order chronologically rather than by insertion.
      const parsed = new Date(post.date);
      const publishedAt = Number.isNaN(parsed.getTime()) ? undefined : parsed;

      await Post.create({
        ...post,
        featured: post.featured ?? false,
        ...(publishedAt ? { publishedAt } : {}),
      });
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
