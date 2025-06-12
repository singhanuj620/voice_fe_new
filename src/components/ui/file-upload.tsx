"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { BeatLoader } from "react-spinners";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  isLoading,
  uploadMessage,
}: {
  onChange?: (files: File[]) => void;
  isLoading?: boolean;
  uploadMessage?: string | null;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden bg-black dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-md dark:shadow-lg"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            WebkitMaskImage:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "radial-gradient(ellipse at center, #18181b, transparent)"
                : "radial-gradient(ellipse at center, white, transparent)",
            maskImage:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "radial-gradient(ellipse at center, #18181b, transparent)"
                : "radial-gradient(ellipse at center, white, transparent)",
          }}
        >
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-white text-3xl">
            Upload Report
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-500 dark:text-neutral-400 text-base mt-2">
            Drag or drop your file here or click to upload
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-10 bg-black dark:bg-black flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md border border-neutral-200 dark:border-neutral-800",
                    "shadow-sm dark:shadow-md"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-white truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 shadow-input"
                    >
                      {(file.size / 1024).toFixed(2)} KB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-200 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-black text-white"
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      <div className="mt-4">
                        <BeatLoader
                          color={isLoading ? "#6366F1" : "#a5b4fc"}
                          loading={isLoading}
                          size={10}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                        {!isLoading && uploadMessage && (
                          <span className={
                            uploadMessage.toLowerCase().includes("error")
                              ? "text-red-500"
                              : "text-green-500"
                          }>
                            {uploadMessage}
                          </span>
                        )}
                      </div>
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-10 bg-black dark:bg-black flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md border border-dashed border-neutral-200 dark:border-neutral-700",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)] dark:shadow-[0px_10px_50px_rgba(0,0,0,0.3)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 dark:text-neutral-300 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 dark:border-sky-700 inset-0 z-5 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-black dark:bg-black shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-neutral-900 dark:bg-neutral-950"
                  : "bg-neutral-900 dark:bg-neutral-900 shadow-[0px_0px_1px_3px_rgba(30,30,30,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(20,20,20,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
