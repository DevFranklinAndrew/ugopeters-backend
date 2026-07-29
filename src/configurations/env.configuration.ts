import dotenv from "dotenv";

dotenv.config();

const envConfig = {
  PORT: process.env.PORT ?? "4000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/ugopeters",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",

  // Admin auth (CMS)
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  // Seed script credentials (default to the frontend's demo login)
  ADMIN_NAME: process.env.ADMIN_NAME ?? "Ugo Peters",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@ugopeters.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "admin123",

  // Cloudinary (blog image uploads)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER ?? "ugopeters/blog",
};

export default envConfig;
