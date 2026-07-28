import dotenv from "dotenv";

dotenv.config();

const envConfig = {
  PORT: process.env.PORT ?? "4000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/ugopeters",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
};

export default envConfig;
