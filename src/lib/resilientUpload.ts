/**
 * Resilient Image Upload Pipeline for Duck Cosmetics Admin
 * 
 * Multi-tier zero-failure upload strategy:
 * 1. Automatic client-side canvas compression (downscales large camera/phone photos to max 1920px)
 * 2. Direct Unsigned Cloudinary CDN Upload (bypasses Vercel serverless body limits, ultra-fast)
 * 3. Server Proxy Fallback (/api/upload -> Cloudinary/Firebase)
 * 4. Guaranteed Client Base64 Data URI Fallback (ensures user is never blocked even if totally offline)
 */

import { uploadImageToCloudinary, isCloudinaryConfigured } from "./cloudinaryClient";

export interface ResilientUploadResult {
  url: string;
  provider: "cloudinary-client" | "cloudinary-server" | "server" | "local" | "data-uri";
  filename: string;
}

/**
 * Convert a File or Blob into a Base64 Data URI
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Compress and downscale an image on an HTML5 canvas before uploading.
 * Shrinks 10MB camera photos down to <800KB in milliseconds.
 */
export async function compressImageClient(
  file: File,
  maxDimension = 1920,
  quality = 0.88
): Promise<File | Blob> {
  // If not a compressible image (SVG, GIF) or already small (< 400KB), return as is
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    file.size <= 400 * 1024
  ) {
    return file;
  }

  // If running in an environment without DOM/Image/canvas (SSR), return original
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  return new Promise((resolve) => {
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If dimensions are within bounds and file is under 1.2MB, keep original
        if (width <= maxDimension && height <= maxDimension && file.size < 1.2 * 1024 * 1024) {
          resolve(file);
          return;
        }

        // Calculate aspect ratio scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(file);
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = file.type === "image/png" ? "image/png" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + (targetMime === "image/png" ? ".png" : ".jpg"), {
                type: targetMime,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // If canvas blob is somehow larger or null, keep original
              resolve(file);
            }
          },
          targetMime,
          quality
        );
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Upload a single image file with automatic multi-tier fallback.
 */
export async function uploadSingleImageResilient(
  file: File,
  folder = "duck_cosmetics"
): Promise<ResilientUploadResult> {
  const preparedFile = (await compressImageClient(file)) as File;

  // Tier 1: Direct Client Cloudinary CDN Upload (Instant, Bypasses Vercel Serverless Limits)
  if (isCloudinaryConfigured()) {
    try {
      const cldRes = await uploadImageToCloudinary(preparedFile, folder);
      if (cldRes && cldRes.url) {
        return {
          url: cldRes.url,
          provider: "cloudinary-client",
          filename: file.name,
        };
      }
    } catch (cldErr) {
      console.warn("[ResilientUpload] Client Cloudinary upload direct failed, falling back to server route:", cldErr);
    }
  }

  // Tier 2: Server API Upload Route (/api/upload)
  try {
    const formData = new FormData();
    formData.append("file", preparedFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.success && data.url) {
        return {
          url: data.url,
          provider: data.provider || "server",
          filename: file.name,
        };
      }
    }
  } catch (apiErr) {
    console.warn("[ResilientUpload] Server /api/upload failed, falling back to base64 data URI:", apiErr);
  }

  // Tier 3: Zero-Failure In-Browser Base64 Data URI Fallback
  // Guaranteed to always work so the admin user is never blocked or left with a broken UI
  try {
    const dataUri = await fileToBase64(preparedFile);
    return {
      url: dataUri,
      provider: "data-uri",
      filename: file.name,
    };
  } catch (dataErr) {
    console.error("[ResilientUpload] Base64 fallback failed:", dataErr);
    throw new Error("Unable to read image file. Please verify file permissions or try another image.");
  }
}

/**
 * Upload multiple images with resilient parallel execution.
 */
export async function uploadMultipleImagesResilient(
  files: FileList | File[],
  folder = "duck_products"
): Promise<string[]> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return [];

  const results = await Promise.all(
    fileArray.map(async (file) => {
      try {
        const res = await uploadSingleImageResilient(file, folder);
        return res.url;
      } catch (err) {
        console.error(`[ResilientUpload] Failed to process ${file.name}:`, err);
        return null;
      }
    })
  );

  return results.filter((url): url is string => Boolean(url));
}
