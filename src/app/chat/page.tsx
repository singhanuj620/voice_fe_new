/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

// Extend Window interface for SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    MediaRecorder: typeof MediaRecorder;
  }
}

export default function ChatPage() {
  const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_BASE_URL;
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    setAudioUrl(null);
    setIsRecording(true);
    setIsLoading(false);
    audioChunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsLoading(true);
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "voice.webm");

        try {
          const response = await fetch(`${BE_BASE_URL}/voice-to-text`, {
            method: "POST",
            body: formData,
          });
          if (!response.ok) throw new Error("Failed to get audio");
          const blob = await response.blob();
          setAudioUrl(URL.createObjectURL(blob));
        } catch {
          alert("Error processing audio");
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
    } catch {
      setIsRecording(false);
      alert("Could not access microphone");
    }
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream
      .getTracks()
      .forEach((track) => track.stop());
  };

  // Handle mic button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-100 dark:bg-black transition-colors">
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <div className="flex flex-col justify-center items-center h-full py-12 gap-8">
          {/* Mic Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            animate={
              isRecording
                ? { scale: [1, 1.2, 1], boxShadow: "0 0 0 8px #f87171" }
                : { scale: 1, boxShadow: "0 0 0 0px transparent" }
            }
            transition={{
              repeat: isRecording ? Infinity : 0,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-red-500 text-white shadow-lg focus:outline-none transition-all
              ${isRecording ? "ring-4 ring-red-300" : "hover:bg-red-600"}
            `}
            onClick={handleMicClick}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {isRecording ? (
                // Stop icon
                <rect
                  x="7"
                  y="7"
                  width="10"
                  height="10"
                  rx="2"
                  fill="currentColor"
                />
              ) : (
                // Standard mic icon
                <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a1 1 0 1 1 2 0 7 7 0 0 1-6 6.92V21a1 1 0 1 1-2 0v-2.08A7 7 0 0 1 5 12a1 1 0 1 1 2 0 5 5 0 0 0 10 0z" />
              )}
            </svg>
            {/* Recording pulse animation */}
            <AnimatePresence>
              {isRecording && (
                <motion.span
                  className="absolute w-full h-full rounded-full border-4 border-red-400 opacity-60"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              )}
            </AnimatePresence>
          </motion.button>

          {/* Spinner while loading */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="flex items-center justify-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio Player */}
          {audioUrl && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full mt-12 max-w-md flex justify-center items-center bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl shadow-2xl p-6 border border-neutral-700"
            >
              <audio
                controls
                autoPlay
                src={audioUrl}
                className="w-full h-14 bg-transparent text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-none"
                style={{ accentColor: '#60a5fa', background: 'transparent', borderRadius: '0.75rem', minHeight: 0 }}
              >
                Your browser does not support the audio element.
              </audio>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
