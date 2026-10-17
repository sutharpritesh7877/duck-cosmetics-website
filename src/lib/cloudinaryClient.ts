/**
 * Cloudinary Direct Unsigned Upload Client
 * Uploads images directly from the browser to Cloudinary CDN without exposing API secrets.
 */

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export function getCloudinaryConfig() {
  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "").trim();
  const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "").trim();
  const configured = Boolean(
    cloudName &&
    uploadPreset &&
    !cloudName.includes("your-") &&
    !uploadPreset.includes("your-")
  );

  return {
    cloudName,
    uploadPreset,
    configured,
  };
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig().configured;
}

/**
 * Uploads an image file to Cloudinary via unsigned upload preset.
 * Returns the HTTPS secure_url string hosted on Cloudinary CDN.
 */
export async function uploadImageToCloudinary(
  file: File | Blob,
  folder = "duck_cosmetics"
): Promise<CloudinaryUploadResponse> {
  const { cloudName, uploadPreset, configured } = getCloudinaryConfig();

  if (!configured) {
    throw new Error(
      "Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file or Vercel Environment Variables."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Cloudinary upload failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
  };
}
