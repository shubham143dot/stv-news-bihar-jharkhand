// components/admin/ImageKitUploader.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Film } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface ImageKitUploaderProps {
  onUpload: (url: string, type: "image" | "video") => void;
  currentUrl?: string;
}

export default function ImageKitUploader({
  onUpload,
  currentUrl,
}: ImageKitUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setError("");
    setUploading(true);

    try {
      // Step 1: Get auth token from our server
      const authRes = await fetch("/api/imagekit-auth");
      if (!authRes.ok) throw new Error("Auth token fetch failed");
      const { token, expire, signature } = await authRes.json();

      // Step 2: Upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${Date.now()}-${file.name}`);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);
      formData.append("folder", "/stv-news");

      const uploadRes = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error("Upload failed");
      const data = await uploadRes.json();

      const fileType = file.type.startsWith("video/") ? "video" : "image";
      setPreview(data.url);
      onUpload(data.url, fileType);
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const clearPreview = () => {
    setPreview("");
    onUpload("", "image");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview ? (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
          <Image
            src={preview}
            alt="Upload preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={clearPreview}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" />
              <p className="text-sm text-gray-500 animate-pulse">
                Uploading to ImageKit...
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP, MP4 — Max 50MB
              </p>
              <div className="flex gap-3 mt-3 text-gray-400">
                <ImageIcon className="w-5 h-5" />
                <Film className="w-5 h-5" />
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
