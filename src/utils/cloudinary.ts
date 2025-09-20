import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY, // ✅ fixed typo
  api_secret: process.env.CLOUD_SECRET_KEY,
});

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  publicId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "certificates",
        public_id: publicId,
        resource_type: "raw",
      },
      (err, result) => {
        if (err) {
          return reject(
            new Error("Cloudinary upload failed: " + err.message)
          );
        }
        if (!result?.secure_url) {
          return reject(new Error("Cloudinary did not return a URL"));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.on("error", (streamErr) => {
      reject(new Error("Cloudinary stream error: " + streamErr.message));
    });

    uploadStream.end(buffer);
  });
};

export default cloudinary;
