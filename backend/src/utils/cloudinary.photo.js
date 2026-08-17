import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {

    try {

        if (!localFilePath) return null;

        // Upload the photo to Cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "image",
                folder: "visitproof"
            }
        );

        // File has been uploaded successfully
        console.log(
            "Photo is uploaded on Cloudinary:",
            response.url
        );

        // Remove temporary file
        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {

        console.log("Upload failed:", error);

        // Remove temporary file if upload failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};


const deleteFromCloudinary = async (publicId) => {

    try {

        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: "image"
            }
        );

        console.log(
            "Photo deleted from Cloudinary:",
            publicId
        );

        return response;

    } catch (error) {

        console.log(
            "Cloudinary delete failed:",
            error
        );

        return null;
    }
};


export {
    uploadOnCloudinary,
    deleteFromCloudinary
};

