/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ReportSidebar from "@/components/ReportSidebar";
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
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const searchParams = useSearchParams();
  const reportId = searchParams.get("report_id");
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  // Fetch chat history when userId or reportId changes
  const fetchChatHistory = async () => {
    if (!userId || !reportId) return;
    try {
      const res = await fetch(
        `${BE_BASE_URL}/get-user-chat-history?user_id=${userId}&report_id=${reportId}`
      );
      const data = await res.json();
      setChatHistory(data.chat_history || []);
    } catch {
      setChatHistory([]);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, reportId]);

  // Auto-scroll to the latest chat message
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

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
        formData.append("userId", userId || "user");
        formData.append("reportId", reportId || "default_report");
        try {
          const response = await fetch(`${BE_BASE_URL}/voice-to-text`, {
            method: "POST",
            body: formData,
          });
          if (!response.ok) throw new Error("Failed to get audio");
          const blob = await response.blob();
          setAudioUrl(URL.createObjectURL(blob));
          // Refresh chat history after voice response
          await fetchChatHistory();
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

  // Fetch userId from session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/session");
        const session = await res.json();
        setUserId(session?.user?.id || null);
      } catch {
        setUserId(null);
      }
    };
    fetchSession();
  }, []);

  // Auto-redirect to first report if no report_id in URL
  useEffect(() => {
    if (!reportId && userId) {
      const fetchFirstReport = async () => {
        try {
          const res = await fetch(
            `${BE_BASE_URL}/get-user-reports?userId=${userId}`
          );
          const data = await res.json();
          if (data.report_ids && data.report_ids.length > 0) {
            router.replace(`/user/chat?report_id=${data.report_ids[0]}`);
          }
        } catch {
          // ignore
        }
      };
      fetchFirstReport();
    }
  }, [reportId, userId, BE_BASE_URL, router]);

  return (
    <div className="h-screen w-screen max-w-full flex bg-gray-100 dark:bg-black transition-colors overflow-x-hidden">
      {/* Sidebar */}
      <ReportSidebar onReportChange={() => setAudioUrl(null)} />
      {/* Main Chat Area */}
      <div className="flex-1 h-full flex justify-center items-start w-full max-w-full overflow-x-hidden">
        <div className="w-full min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg flex flex-col m-0 box-border max-w-full">
          <div className="flex flex-col justify-center items-center flex-1 gap-8 relative w-full max-w-full">
            {/* Chat History */}
            <div
              className="w-full max-h-[90vh] flex flex-col gap-2 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-inner p-4 flex-1 box-border max-w-full"
              ref={chatHistoryRef}
            >
              {chatHistory.length === 0 ? (
                <div className="text-neutral-400 text-center text-sm">
                  No chat history for this report.
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 rounded-lg font-medium text-sm max-w-[80%] break-words shadow-sm transition-colors duration-200 ${
                      msg.sender !== "ai"
                        ? "bg-blue-500/10 dark:bg-blue-400/10 self-end text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                        : "bg-neutral-200/80 dark:bg-neutral-800/80 self-start text-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
                    }`}
                    style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>
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
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full mt-12 max-w-md flex justify-center items-center bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl shadow-2xl p-6 border border-neutral-700"
              >
                <audio
                  controls
                  autoPlay
                  src={audioUrl}
                  className="w-full h-14 bg-transparent text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-none"
                  style={{
                    accentColor: "#60a5fa",
                    background: "transparent",
                    borderRadius: "0.75rem",
                    minHeight: 0,
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {/* Fixed Mic Bar at Screen Bottom */}
      <div className="fixed bottom-0 left-0 w-[75%] ml-[25%] flex justify-end z-50 pointer-events-none">
        <div className="w-full max-w-4xl bg-white/90 dark:bg-neutral-900/90 border-t border-neutral-200 dark:border-neutral-700 shadow-xl px-0 py-3 flex items-center justify-center pointer-events-auto rounded-b-xl">
          <motion.button
            whileTap={{ scale: 0.9 }}
            animate={
              isRecording
                ? { scale: [1, 1.15, 1], boxShadow: "0 0 0 6px #f87171" }
                : { scale: 1, boxShadow: "0 0 0 0px transparent" }
            }
            transition={{
              repeat: isRecording ? Infinity : 0,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-red-500 text-white shadow-lg focus:outline-none transition-all
              ${isRecording ? "ring-2 ring-red-300" : "hover:bg-red-600"}
            `}
            onClick={handleMicClick}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            disabled={isLoading}
            style={{ pointerEvents: "auto" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {isRecording ? (
                <rect
                  x="7"
                  y="7"
                  width="10"
                  height="10"
                  rx="2"
                  fill="currentColor"
                />
              ) : (
                <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a1 1 0 1 1 2 0 7 7 0 0 1-6 6.92V21a1 1 0 1 1-2 0v-2.08A7 7 0 0 1 5 12a1 1 0 1 1 2 0 5 5 0 0 0 10 0z" />
              )}
            </svg>
            <AnimatePresence>
              {isRecording && (
                <motion.span
                  className="absolute w-full h-full rounded-full border-2 border-red-400 opacity-60"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.3, opacity: 0 }}
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
        </div>
      </div>
    </div>
  );
}
