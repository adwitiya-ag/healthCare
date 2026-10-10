import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = process.env.ENVIRONMENT === "production"
    ? "/tmp"
    : path.join(__dirname, "../../public/temp");

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// This saves the file to a TEMPORARY local folder first.
// Our controller will then upload it to Cloudinary and delete this
// temp copy. We need this in-between step because Cloudinary's upload
// function expects a file path, not a raw file in memory.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir); // make sure this folder exists!
    },
    filename: function (req, file, cb) {
        // keep the original file name for the temp copy
        cb(null, file.originalname);
    },
});

// Only allow real excel files — reject anything else
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // for .xlsx
        "application/vnd.ms-excel", // for .xls
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only .xlsx or .xls files are allowed"), false);
    }
};

export const uploadExcel = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});