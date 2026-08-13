import { v2 as cloudinary } from "cloudinary";
import envConfig from "./env.configuration";

// Configured as an import side-effect, so importing this module anywhere
// guarantees the SDK is ready before the first upload.
cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
