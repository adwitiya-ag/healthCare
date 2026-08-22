import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Connect to your Cloudinary account using the .env values
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This function takes a LOCAL file path (where multer temporarily 
// saved the file), uploads it to Cloudinary, then deletes the local
// copy since we don't need it anymore.
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Step 1: upload the file to Cloudinary
    // resource_type: "raw" is important for non-image files like
    // .xlsx, .pdf, .docx — without this, Cloudinary assumes it's an image
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw",
      folder: "tourplans", // keeps your Cloudinary account organized
    });

    // Step 2: delete the temporary local file — upload succeeded,
    // we don't need the local copy anymore
    fs.unlinkSync(localFilePath);

    // response.secure_url is the permanent link to the uploaded file
    return response;
  } catch (error) {
    // Step 3: if upload failed, still clean up the local temp file
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };