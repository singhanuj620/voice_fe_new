/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_BASE_URL;

export default function FileUploadDemo() {
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  // If you have a Session type from your auth library, import and use it:
  // import { Session } from "next-auth"; // or wherever your Session type is

  type UserSession = any; // Use 'any' or import the correct Session type

  const [userSession, setUserSession] = useState<UserSession>(null);
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/session");
        const session = await res.json();
        setUserSession(session.user);
      } catch (error) {
        console.error("Error fetching session from API:", error);
        setUserSession(null);
      }
    };
    fetchSession();
  }, []);
  const handleFileUpload = async (files: File[]) => {
    setFiles(files);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("userId", userSession?.id || "user"); // Ensure userId is always a string
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
        window.location.href = "/user/chat";
      }, 2000);
    } catch (e) {
      setIsLoading(false);
      setUploadMessage(
        "Error uploading file: " + (e instanceof Error ? e.message : String(e))
      );
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="w-full max-w-4xl mx-auto max-h-[90vh] border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload
          onChange={handleFileUpload}
          isLoading={isLoading}
          uploadMessage={uploadMessage}
        />
      </div>
    </div>
  );
}
