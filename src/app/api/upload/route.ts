import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { uploadToFirebaseStorage, isFirebaseConfigured } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const fileList: File[] = [];
    if (files && files.length > 0) {
      fileList.push(...files);
    } else if (singleFile) {
      fileList.push(singleFile);
    }

    if (fileList.length === 0) {
      return NextResponse.json(
        { success: false, error: "No image files provided for upload." },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    const cloudName = (
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.VITE_CLOUDINARY_CLOUD_NAME ||
      "fddgundt"
    ).trim();

    const uploadPreset = (
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
      "duck_unsigned_preset"
    ).trim();

    for (const file of fileList) {
      // Allow image MIME types or image file extensions
      const isImage =
        (file.type && file.type.startsWith("image/")) ||
        /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|ico)$/i.test(file.name);

      if (!isImage) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";
      let uploadedUrl: string | null = null;

      // 1. Primary Cloud Provider: Cloudinary CDN (Instant, Unsigned, Permanent)
      if (cloudName && uploadPreset) {
        try {
          const cldFormData = new FormData();
          const fileBlob = new Blob([buffer], { type: mimeType });
          cldFormData.append("file", fileBlob, file.name);
          cldFormData.append("upload_preset", uploadPreset);
          cldFormData.append("folder", "duck-cosmetics-products");

          const cldRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: cldFormData,
            }
          );

          if (cldRes.ok) {
            const cldData = await cldRes.json();
            if (cldData.secure_url) {
              uploadedUrl = cldData.secure_url;
            }
          }
        } catch (cldErr) {
          console.warn("[Upload API] Cloudinary upload attempt error:", cldErr);
        }
      }

      // 2. Secondary Cloud Provider: Firebase Cloud Storage
      if (!uploadedUrl && isFirebaseConfigured()) {
        try {
          const firebaseUrl = await uploadToFirebaseStorage(
            buffer,
            file.name,
            mimeType,
            "duck-cosmetics-assets"
          );
          if (firebaseUrl) {
            uploadedUrl = firebaseUrl;
          }
        } catch (fbError) {
          console.warn("[Upload API] Firebase Storage fallback attempt error:", fbError);
        }
      }

      // 3. Tertiary Provider: Local Filesystem Storage (Writable environments like local dev)
      if (!uploadedUrl) {
        try {
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const ext = path.extname(file.name) || ".jpg";
          const baseName = path
            .basename(file.name, ext)
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 30);
          const fileName = `duck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${baseName}${ext}`;
          const filePath = path.join(uploadsDir, fileName);

          fs.writeFileSync(filePath, buffer);
          uploadedUrl = `/uploads/${fileName}`;
        } catch (localError) {
          console.warn("[Upload API] Local filesystem write fallback skipped (e.g. read-only serverless):", localError);
        }
      }

      // 4. Guaranteed Zero-Failure Fallback: Optimized Base64 Data URI
      if (!uploadedUrl) {
        uploadedUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      }

      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select valid image files (JPG, PNG, WebP) to upload." },
        { status: 400 }
      );
    }

    const primaryUrl = uploadedUrls[0];
    const provider = primaryUrl.includes("cloudinary.com")
      ? "cloudinary"
      : primaryUrl.includes("firebasestorage")
      ? "firebase"
      : primaryUrl.startsWith("data:")
      ? "inline-data"
      : "local";

    return NextResponse.json({
      success: true,
      url: primaryUrl,
      urls: uploadedUrls,
      count: uploadedUrls.length,
      storageProvider: provider,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "File upload failed on server." },
      { status: 500 }
    );
  }
}
