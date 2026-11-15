"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Check, Image as ImageIcon, RefreshCw, Link as LinkIcon, Cloud } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { uploadSingleImageResilient } from "@/lib/resilientUpload";

interface ImageUploadDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: "video" | "square" | "portrait" | "banner";
  maxSizeMB?: number;
}

export function ImageUploadDropzone({
  value,
  onChange,
  label = "Upload Image",
  description = "Drag and drop your high-resolution asset or click to browse (JPG, PNG, WebP up to 10MB)",
  aspectRatio = "video",
  maxSizeMB = 10,
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    const isImage =
      (file.type && file.type.startsWith("image/")) ||
      /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|ico)$/i.test(file.name);

    if (!isImage) {
      toastError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toastError(`Image exceeds maximum allowed size of ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadSingleImageResilient(file, "duck_cms");
      if (result && result.url) {
        onChange(result.url);
        toastSuccess("Image uploaded successfully.");
      } else {
        toastError("Upload could not complete. Please try again.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toastError(err?.message || "Error during image upload. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleApplyManualUrl = () => {
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setManualUrl("");
    setShowUrlInput(false);
    toastSuccess("Image URL applied.");
  };

  const handleRemove = () => {
    onChange("");
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square max-w-[280px]"
      : aspectRatio === "portrait"
      ? "aspect-[3/4] max-w-[280px]"
      : aspectRatio === "banner"
      ? "aspect-[21/9] w-full"
      : "aspect-video w-full";

  return (
    <div className="space-y-2 font-sans">
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-medium text-text-muted hover:text-primary transition flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? "Hide URL Input" : "Paste URL Instead"}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8F6FA] border border-lilac-border">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/asset.jpg"
            className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition"
          >
            Apply
          </button>
        </div>
      )}

      {value ? (
        /* Preview Card */
        <div className="relative rounded-2xl overflow-hidden border border-lilac-border bg-[#F8F6FA] group">
          <div className={`relative ${aspectClass} mx-auto overflow-hidden rounded-xl`}>
            <Image
              src={value}
              alt="Uploaded Asset"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white text-text-dark text-xs font-semibold uppercase tracking-wider hover:bg-lilac transition shadow-md flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-rose-700 transition shadow-md flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <div className="p-2.5 bg-white border-t border-lilac-border/60 flex items-center justify-between text-[11px] text-text-muted">
            <span className="truncate max-w-[280px] font-mono">{value}</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Ready</span>
            </span>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-lilac/70 scale-[1.01]"
              : "border-lilac-border hover:border-primary/60 bg-[#F8F6FA] hover:bg-lilac/30"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-text-dark uppercase tracking-wider">
                Uploading & Storing Asset...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-lilac-border flex items-center justify-center text-primary group-hover:scale-110 transition">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-text-dark tracking-wide">
                Click to upload or drag & drop image
              </p>
              <p className="text-[11px] text-text-muted max-w-xs leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
