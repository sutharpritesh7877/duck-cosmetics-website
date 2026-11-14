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

    for (const file of fileList) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Option A: Primary Cloud Upload to Firebase Storage
      let uploadedToCloud = false;
      if (isFirebaseConfigured()) {
        try {
          const firebaseUrl = await uploadToFirebaseStorage(
            buffer,
            file.name,
            file.type || "image/jpeg",
            "duck-cosmetics-assets"
          );
          if (firebaseUrl) {
            uploadedUrls.push(firebaseUrl);
            uploadedToCloud = true;
          }
        } catch (fbError) {
          console.warn("[Upload API] Firebase Storage upload error, falling back to local:", fbError);
        }
      }

      // Option B: Fallback to local server filesystem (for offline / local testing)
      if (!uploadedToCloud) {
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
          uploadedUrls.push(`/uploads/${fileName}`);
        } catch (localError) {
          console.error("[Upload API] Local write fallback error:", localError);
        }
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid file format or upload failed. Please upload valid image files (JPG, PNG, WebP)." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
      storageProvider: uploadedUrls[0].includes("firebasestorage") ? "firebase" : "local",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "File upload failed on server." },
      { status: 500 }
    );
  }
}
