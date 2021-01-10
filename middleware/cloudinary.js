import cloud from "cloudinary";
import { appConfig } from "./app-config.js";

const cloudinary = cloud.v2;

cloudinary.config({
  cloud_name: appConfig.CLOUDINARY_CLOUD_API_NAME,
  api_key: appConfig.CLOUDINARY_CLOUD_API_KEY,
  api_secret: appConfig.CLOUDINARY_CLOUD_API_SECRET,
});

export default cloudinary;