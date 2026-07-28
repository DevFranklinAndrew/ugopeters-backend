import mongoose from "mongoose";
import envConfig from "./env.configuration";

const dbConfig = async (): Promise<void> => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("[db] Connected to MongoDB");
  } catch (error) {
    console.error(
      "[db] Connection error:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};

export default dbConfig;
