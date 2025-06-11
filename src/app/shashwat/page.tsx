"use client";
// VoiceToText.jsx
import { useRef, useState } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_BASE_URL;

interface SpeechRecognitionEventWithResults extends Event {
  results: SpeechRecognitionResultList;
}

export default function VoiceToText() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  // Add this type declaration above your component or at the top of the file
  type SpeechRecognitionType = typeof window.SpeechRecognition extends undefined
    ? typeof window.webkitSpeechRecognition
    : typeof window.SpeechRecognition;

  const recognitionRef = useRef<null | InstanceType<SpeechRecognitionType>>(
    null
  );
  const mediaRecorderRef = useRef<null | MediaRecorder>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  // Accent/voice selection state
  const [accentCode, setAccentCode] = useState("en-IN");
  const [voiceName, setVoiceName] = useState("en-IN-Female");
  // STT input language selection state
  const [sttLanguage, setSttLanguage] = useState("en-US");
  const [typedQuestion, setTypedQuestion] = useState("");
  const [typedLoading, setTypedLoading] = useState(false);

  // When user selects input language, set STT language accordingly
  // (UI code for language selection already exists)

  const startRecording = async () => {
    setTranscript("");
    setApiResponse(null);
    setAudioUrl(null);
    // SpeechRecognition setup
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = sttLanguage; // Use selected STT language
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: SpeechRecognitionEventWithResults) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };
    interface SpeechRecognitionErrorEvent extends Event {
      error: string;
    }
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setTranscript("Speech recognition error: " + e.error);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    // Start audio recording
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream, {
      mimeType: "audio/webm",
    });
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      console.log("Recording stopped");
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      // Send .webm file to backend
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", blob, "voice.webm");
        // Do NOT append stt_language_code
        const res = await fetch(`${BE_BASE_URL}/voice-to-text`, {
          method: "POST",
          body: formData,
        });
        // Expecting audio file in response
        if (!res.ok) throw new Error("Failed to get audio response");
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setApiResponse(null); // No text, just audio
        setAudioUrl(audioUrl);
        // Auto play audio once (not loop)
        setTimeout(() => {
          const audio = document.getElementById(
            "voice-audio-player"
          ) as HTMLAudioElement | null;
          if (audio) audio.play();
        }, 100);
      } catch (e) {
        const errorMsg =
          e && typeof e === "object" && "message" in e
            ? (e as { message: string }).message
            : String(e);
        setApiResponse("Error receiving audio: " + errorMsg);
      }
      setLoading(false);
    };
    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setRecording(false);
  };

  interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget & { files: FileList };
  }

  const handleFileChange = (e: FileChangeEvent) => {
    setUploadFile(e.target.files[0]);
    setUploadMessage("");
  };

  interface FileUploadResponse {
    message?: string;
  }

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadLoading(true);
    setUploadMessage("");
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      // Do NOT append stt_language_code
      const res = await fetch(`${BE_BASE_URL}/upload-report-file`, {
        method: "POST",
        body: formData,
      });
      const data: FileUploadResponse = await res.json();
      if (data && data.message) {
        setUploadMessage(data.message);
      }
    } catch (e) {
      const errorMsg =
        e && typeof e === "object" && "message" in e
          ? (e as { message: string }).message
          : String(e);
      setUploadMessage("Error uploading file: " + errorMsg);
    }
    setUploadLoading(false);
  };

  // Handler for submitting typed question

  const handleTypedSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!typedQuestion.trim()) return;
    setTypedLoading(true);
    setApiResponse(null);
    setAudioUrl(null);
    try {
      const formData = new FormData();
      formData.append("text", typedQuestion);
      formData.append("accent_code", accentCode);
      formData.append("voice_name", voiceName);
      const res: Response = await fetch(`${BE_BASE_URL}/text-to-voice`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to get audio response");
      const audioBlob: Blob = await res.blob();
      const audioUrl: string = URL.createObjectURL(audioBlob);
      setApiResponse(null);
      setAudioUrl(audioUrl);
      setTimeout(() => {
        const audio = document.getElementById(
          "voice-audio-player"
        ) as HTMLAudioElement | null;
        if (audio) audio.play();
      }, 100);
    } catch (e) {
      const errorMsg =
        e && typeof e === "object" && "message" in e
          ? (e as { message: string }).message
          : String(e);
      setApiResponse("Error receiving audio: " + errorMsg);
    }
    setTypedLoading(false);
  };

  return (
    <section className="section" style={{ minHeight: "70vh" }}>
      <h2 className="section-title">Voice to Text</h2>
      <p
        style={{
          textAlign: "center",
          maxWidth: 500,
          margin: "0 auto 2rem auto",
        }}
      >
        Press the microphone to record your voice. Your speech will be converted
        to text using our AI backend.
      </p>
      {/* File upload section for reports */}
      <div
        style={{
          margin: "32px auto 0 auto",
          padding: 24,
          background: "#f8fafc",
          borderRadius: 10,
          maxWidth: 420,
          boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)",
          border: "1px solid #e3e3e3",
        }}
      >
        <h3
          style={{
            marginBottom: 12,
            fontWeight: 600,
            fontSize: 20,
            color: "black",
          }}
        >
          Upload Report File
        </h3>
        <form
          onSubmit={handleFileUpload}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.twbx,.twb,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/x-twbx,application/xml"
            onChange={handleFileChange}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            disabled={uploadLoading}
          />
          <button
            type="submit"
            className="landing-hero-cta"
            style={{ fontWeight: 600, fontSize: 16, padding: "10px 0" }}
            disabled={uploadLoading || !uploadFile}
          >
            {uploadLoading ? "Uploading..." : "Upload File"}
          </button>
        </form>
        {uploadLoading && (
          <div style={{ marginTop: 12 }}>
            <div
              className="spinner"
              style={{
                width: 28,
                height: 28,
                border: "3px solid #90caf9",
                borderTop: "3px solid #1565c0",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={{ color: "#1565c0", marginTop: 6, fontWeight: 500 }}>
              Processing...
            </div>
          </div>
        )}
        {uploadMessage && !uploadLoading && (
          <div
            style={{
              marginTop: 12,
              color: "#388e3c",
              fontWeight: 500,
              background: "#e8f5e9",
              padding: 10,
              borderRadius: 6,
            }}
          >
            {uploadMessage}
          </div>
        )}
      </div>
      <br></br>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <button
          className="landing-hero-cta"
          style={{
            background: recording ? "var(--secondary)" : "var(--accent)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 18,
            position: "relative",
          }}
          onClick={recording ? stopRecording : startRecording}
          aria-pressed={recording}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording && (
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "red",
                marginRight: 6,
                boxShadow: "0 0 8px 2px rgba(255,0,0,0.5)",
                animation: "pulse 1s infinite alternate",
              }}
            />
          )}
          {recording ? <FaStop /> : <FaMicrophone />}{" "}
          {recording ? "Stop" : "Start"} Recording
        </button>
        {/* Add keyframes for pulse animation */}
        <style>{`
          @keyframes pulse {
            0% { box-shadow: 0 0 8px 2px rgba(255,0,0,0.5); }
            100% { box-shadow: 0 0 16px 6px rgba(255,0,0,0.8); }
          }
        `}</style>
        {recording && (
          <div
            style={{
              display: "flex",
              gap: 4,
              margin: "16px 0 0 0",
              height: 32,
            }}
            aria-label="Audio input animation"
          >
            {[1, 2, 3, 4, 5].map((bar, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 16 + Math.sin(Date.now() / 200 + i) * 8,
                  background: "var(--accent)",
                  borderRadius: 3,
                  animation: `waveBar 1s ${i * 0.1}s infinite ease-in-out`,
                }}
              />
            ))}
          </div>
        )}
        {/* Add keyframes for waveform animation */}
        <style>{`
          @keyframes waveBar {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(2.2); }
          }
        `}</style>
        {/* Show transcript if available */}
        {transcript && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 8,
              color: "#222",
              minWidth: 200,
              maxWidth: 400,
              fontSize: 18,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {transcript}
          </div>
        )}
        {/* Show loading spinner and message while waiting for API response */}
        {loading && (
          <div style={{ marginTop: 16 }}>
            <div
              className="spinner"
              style={{
                width: 36,
                height: 36,
                border: "4px solid #90caf9",
                borderTop: "4px solid #1565c0",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={{ color: "#1565c0", marginTop: 8, fontWeight: 500 }}>
              Processing...
            </div>
          </div>
        )}
        {/* Show API response in a separate block if available */}
        {apiResponse && !loading && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#e3f2fd",
              borderRadius: 8,
              color: "#1565c0",
              minWidth: 200,
              maxWidth: 400,
              fontSize: 17,
              fontWeight: 500,
              textAlign: "center",
              border: "1px solid #90caf9",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>API Response</div>
            {apiResponse}
          </div>
        )}
        {/* Show download button and audio player if audio is available */}
        {audioUrl && (
          <>
            {/* <a
              href={audioUrl}
              download="voice.webm"
              style={{
                marginTop: 16,
                display: "inline-block",
                background: "var(--accent)",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 6,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 16,
              }}
            >
              Download .webm
            </a> */}
            {/* Audio player for playback controls */}
            <audio
              id="voice-audio-player"
              src={audioUrl}
              controls
              style={{ display: "block", marginTop: 16, width: 320 }}
            />
          </>
        )}
      </div>
      {/* Accent/voice selection dropdowns */}
      <div style={{ margin: "24px 0 16px 0", textAlign: "center" }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>
          Input Language:
        </label>
        <select
          value={sttLanguage}
          onChange={(e) => {
            setSttLanguage(e.target.value);
            // Reset accent and voice when input language changes
            if (e.target.value === "en-US") {
              setAccentCode("en-IN");
              setVoiceName("en-IN-Female");
            } else if (e.target.value === "hi-IN") {
              setAccentCode("hi-IN");
              setVoiceName("hi-IN-Female");
            }
          }}
          style={{ padding: 6, borderRadius: 4, fontSize: 16, marginRight: 12 }}
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
        </select>
        <label style={{ fontWeight: 600, marginRight: 8 }}>
          Select Accent:
        </label>
        <select
          value={accentCode}
          onChange={(e) => {
            setAccentCode(e.target.value);
            // Set default voice for accent
            if (e.target.value === "en-IN") setVoiceName("en-IN-Female");
            else if (e.target.value === "en-US") setVoiceName("en-US-Female");
            else if (e.target.value === "hi-IN") setVoiceName("hi-IN-Female");
          }}
          style={{
            padding: 6,
            borderRadius: 4,
            fontSize: 16,
            marginRight: 12,
          }}
        >
          {sttLanguage === "en-US" && (
            <>
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
            </>
          )}
          {sttLanguage === "hi-IN" && (
            <option value="hi-IN">Hindi (India)</option>
          )}
        </select>
        <label style={{ fontWeight: 600, marginRight: 8 }}>Voice:</label>
        <select
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          style={{ padding: 6, borderRadius: 4, fontSize: 16 }}
        >
          {sttLanguage === "en-US" && accentCode === "en-IN" && (
            <>
              <option value="en-IN-Male">Male</option>
              <option value="en-IN-Female">Female</option>
            </>
          )}
          {sttLanguage === "en-US" && accentCode === "en-US" && (
            <>
              <option value="en-US-Male">Male</option>
              <option value="en-US-Female">Female</option>
            </>
          )}
          {sttLanguage === "hi-IN" && accentCode === "hi-IN" && (
            <option value="hi-IN-Female">Female</option>
          )}
        </select>
      </div>
      {/* Typed question input */}
      <form
        onSubmit={handleTypedSubmit}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          margin: "16px 0",
        }}
      >
        <input
          type="text"
          value={typedQuestion}
          onChange={(e) => setTypedQuestion(e.target.value)}
          placeholder="Type your question..."
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 17,
            width: 320,
          }}
          disabled={typedLoading}
        />
        <button
          type="submit"
          className="landing-hero-cta"
          style={{ fontWeight: 600, fontSize: 16, padding: "10px 18px" }}
          disabled={typedLoading || !typedQuestion.trim()}
        >
          {typedLoading ? "Processing..." : "Ask"}
        </button>
      </form>
    </section>
  );
}
