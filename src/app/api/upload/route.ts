import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of fileList) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate clean timestamped filename
      const ext = path.extname(file.name) || ".jpg";
      const baseName = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const fileName = `duck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${baseName}${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push(`/uploads/${fileName}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid file format. Please upload valid image files (JPG, PNG, WebP)." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "File upload failed on server." },
      { status: 500 }
    );
  }
}
