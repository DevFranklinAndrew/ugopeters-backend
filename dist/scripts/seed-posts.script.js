"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ts = __importStar(require("typescript"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_configuration_1 = __importDefault(require("../configurations/env.configuration"));
const post_model_1 = __importDefault(require("../models/post.model"));
/**
 * Loads the frontend's static blog data (the source of truth for the initial
 * seed). It lives outside backend's rootDir and is an ESM module, so it can't be
 * `import`ed (tsc rootDir) or `require`d (ERR_REQUIRE_ESM). Instead we read it
 * as text and transpile it in-memory to CommonJS — the file is pure data with
 * no imports, so evaluating it standalone is safe.
 */
const loadFrontendPosts = () => {
    const file = path.resolve(__dirname, "../../../frontend/src/data/post.ts");
    const source = fs.readFileSync(file, "utf8");
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
        },
    });
    const shim = { exports: {} };
    new Function("exports", "module", "require", outputText)(shim.exports, shim, require);
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
const seedPosts = async () => {
    try {
        await mongoose_1.default.connect(env_configuration_1.default.MONGO_URI);
        console.log("[seed] Connected to MongoDB");
        let created = 0;
        let skipped = 0;
        for (const { id: _id, ...post } of posts) {
            const existing = await post_model_1.default.findOne({ slug: post.slug }).select("_id");
            if (existing) {
                skipped += 1;
                continue;
            }
            // The seed data only carries a display date ("January 28, 2026"); derive
            // the sortable publishedAt from it so seeded posts order chronologically
            // rather than by insertion. Unparseable dates fall back to the default.
            const parsed = new Date(post.date);
            const publishedAt = Number.isNaN(parsed.getTime()) ? undefined : parsed;
            await post_model_1.default.create({
                ...post,
                featured: post.featured ?? false,
                ...(publishedAt ? { publishedAt } : {}),
            });
            created += 1;
            console.log(`[seed] Created post: ${post.slug}`);
        }
        console.log(`[seed] Done. Created ${created}, skipped ${skipped}.`);
    }
    catch (error) {
        console.error("[seed] Failed:", error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("[seed] Disconnected.");
    }
};
seedPosts();
//# sourceMappingURL=seed-posts.script.js.map