import cloudinary from "../config/cloudinary.config";

/**
 * Upload a single image buffer to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `saint-valor/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed — no result"));
        resolve(result.secure_url);
      },
    );

    stream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary by its URL.
 */
export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from the URL
    const parts = imageUrl.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return;

    // public_id is everything after 'upload/vXXXXX/' without the extension
    const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExt.replace(/\.[^.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
  }
};
