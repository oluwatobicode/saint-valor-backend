import multer from "multer";
import { Request } from "express";
import { UPLOAD } from "../config";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Store files in memory (buffer) — we upload to Cloudinary, not disk
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

/**
 * Single image upload (e.g. collection image)
 */
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).single("image");

/**
 * Multiple image upload — max 6 (1 main + 5 sub) for products
 */
export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).array("images", 6);
