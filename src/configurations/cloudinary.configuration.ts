import { v2 as cloudinary } from "cloudinary";
import envConfig from "./env.configuration";

/**
 * Configures the Cloudinary SDK from the environment. Runs as an import
 * side-effect (like env.configuration's dotenv.config()), so importing this
 * module anywhere ensures the SDK is ready before the first upload.
 */
cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
