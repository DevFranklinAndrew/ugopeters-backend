import { Readable } from "stream";
import cloudinary from "../configurations/cloudinary.configuration";
import envConfig from "../configurations/env.configuration";
import AppError from "../errors/app.error";

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Streams an in-memory image buffer to Cloudinary and returns its hosted URL.
 * Large images are capped at 2000px wide (aspect preserved) to keep delivery
 * light. `publicId` is returned so a future step can delete orphaned assets.
 */
const uploadImage = (buffer: Buffer): Promise<UploadResult> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: envConfig.CLOUDINARY_FOLDER,
        resource_type: "image",
        transformation: [{ width: 2000, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result) {
          // Log the real Cloudinary error server-side; return a clean message.
          console.error("[upload] Cloudinary error:", error);
          return reject(
            new AppError("Image upload failed. Please try again.", 502),
          );
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    Readable.from(buffer).pipe(stream);
  });

/**
 * Recovers a Cloudinary `publicId` (incl. folder) from one of its delivery
 * URLs, so assets can be deleted without persisting the id separately. Strips
 * any transformation segments and the `v<version>/` prefix, then the extension.
 * Returns null for anything that isn't a Cloudinary-hosted URL.
 *
 *   https://res.cloudinary.com/x/image/upload/c_limit,w_2000/v17/ugopeters/blog/abc.png
 *     → "ugopeters/blog/abc"
 */
const publicIdFromUrl = (url: string): string | null => {
  if (!url.includes("res.cloudinary.com")) return null;
  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;
  // Drop leading transformation segments + the version segment (v123/).
  const withoutVersion = afterUpload.replace(/^(?:[^/]+\/)*?v\d+\//, "");
  const publicId = withoutVersion.replace(/\.[^./]+$/, "");
  return publicId || null;
};

/**
 * Best-effort deletion of Cloudinary assets by their URLs. Non-Cloudinary URLs
 * are ignored; individual failures are logged but never thrown — cleanup must
 * not fail the post operation that triggered it.
 */
const deleteImages = async (urls: string[]): Promise<void> => {
  const publicIds = urls
    .map(publicIdFromUrl)
    .filter((id): id is string => id !== null);

  const results = await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
  );

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[upload] Failed to delete ${publicIds[i]}:`, result.reason);
    }
  });
};

export { uploadImage, publicIdFromUrl, deleteImages };
