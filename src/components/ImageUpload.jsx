import { useRef, useState } from "react";
import { uploadToSupabase } from "../lib/supabase";
import { compressImage } from "../lib/imageCompress";
import Feedback from "./Feedback";

export default function ImageUpload({
  folder,
  hint,
  icon = "🖼️",
  maxMB = 10,
  onUploaded,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      setFeedback({ ok: false, msg: `File too large. Max ${maxMB}MB.` });
      return;
    }
    setUploading(true);
    setFeedback(null);
    try {
      const compressed = await compressImage(file, {
        maxDimension: 1600,
        quality: 0.8,
      });
      const url = await uploadToSupabase(compressed, folder);
      setPreview(url);
      setFeedback({ ok: true, msg: "✦ Image uploaded!" });
      onUploaded?.(url);
    } catch (e) {
      setFeedback({ ok: false, msg: "✕ " + e.message });
    }
    setUploading(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div>
      {hint && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            background: "var(--cream)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-soft)",
              lineHeight: 1.8,
              fontFamily: "'Cinzel',serif",
              letterSpacing: "0.5px",
            }}
          >
            {hint}
          </div>
        </div>
      )}
      <div
        onClick={() => fileRef.current.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed var(--border)",
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          background: uploading ? "rgba(212,87,10,0.03)" : "var(--cream)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--saffron)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "220px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          />
        ) : (
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>{icon}</div>
        )}
        <div style={{ color: "var(--text-soft)", fontSize: "0.8rem" }}>
          {uploading ? "Uploading..." : "Click or drag image here"}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
      <Feedback feedback={feedback} />
    </div>
  );
}
