/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_BASE_URL;

export default function FileUploadDemo() {
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = async (files: File[]) => {
    setFiles(files);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      const res = await fetch(`${BE_BASE_URL}/upload-report-file`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Upload response:", data);
      if (data && data.message) {
        setUploadMessage("Upload complete.");
      }
      setIsLoading(false);
      setTimeout(() => {
        window.location.href = "/chat";
      }, 2000);
    } catch (e) {
      setIsLoading(false);
      setUploadMessage(
        "Error uploading file: " + (e instanceof Error ? e.message : String(e))
      );
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center -mt-18">
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload
          onChange={handleFileUpload}
          isLoading={isLoading}
          uploadMessage={uploadMessage}
        />
      </div>
    </div>
  );
}
