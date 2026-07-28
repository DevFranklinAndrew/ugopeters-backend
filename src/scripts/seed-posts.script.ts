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

// The frontend's static blog data is the source of truth for the initial seed.
// It lives outside backend's rootDir and is an ESM module, so we pull it via a
// runtime `require` (resolved by ts-node's .ts loader under
// `ts-node --transpile-only` — see the `seed:posts` npm script) rather than a
// static `import`, which `tsc` would reject with TS6059.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { posts } = require("../../../frontend/src/data/post") as {
  posts: SeedPost[];
};

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
