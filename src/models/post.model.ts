import { model, Schema, type HydratedDocument, type Model } from "mongoose";

/** Mirrors the frontend `Post` (frontend/src/data/post.ts); `content` is raw HTML. */
export interface IPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  /** Sortable publish date; `date` above is only its display rendering. */
  publishedAt: Date;
  category: string;
  readTime: string;
  image: string;
  featured: boolean;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PostDocument = HydratedDocument<IPost>;
type PostModel = Model<IPost>;

const postSchema = new Schema<IPost, PostModel>(
  {
    slug: {
      type: String,
      required: [true, "Slug is required."],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required."],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required."],
    },
    date: {
      type: String,
      required: [true, "Date is required."],
    },
    // Indexed because every list query sorts on it.
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },
    readTime: {
      type: String,
      required: [true, "Read time is required."],
    },
    image: {
      type: String,
      required: [true, "Image is required."],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      default: "Ugo Peters",
      trim: true,
    },
  },
  { timestamps: true },
);

const Post = model<IPost, PostModel>("Post", postSchema);

export default Post;
