import { useState, useEffect } from "react";
import { fetchConfig, saveConfig } from "../../lib/api";
import { uploadToSupabase, deleteFromSupabase } from "../../lib/supabase";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Feedback from "../../components/Feedback";

export default function AboutImageAdmin() {
  const [currentImage, setCurrentImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchConfig().then((cfg) => {
      if (cfg?.aboutImage) setCurrentImage(cfg.aboutImage);
    });
  }, []);

  const flash = (ok, msg) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      flash(false, "File too large. Max 8MB.");
      return;
    }
    setUploading(true);
    try {
      if (currentImage) {
        try {
          await deleteFromSupabase(currentImage);
        } catch (_) {}
      }
      const url = await uploadToSupabase(file, "about");
      await saveConfig({ aboutImage: url });
      setCurrentImage(url);
      flash(true, "✦ About image updated!");
    } catch (e) {
      flash(false, "✕ " + e.message);
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!currentImage) return;
    if (
      !confirm(
        "Delete the current about image? The site will fall back to the default.",
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteFromSupabase(currentImage);
      await saveConfig({ aboutImage: null });
      setCurrentImage(null);
      flash(true, "✦ About image removed.");
    } catch (e) {
      flash(false, "✕ " + e.message);
    }
    setDeleting(false);
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <Card>
        <CardHeader
          title="About Page Image"
          subtitle="Portrait image shown on the about page"
        />
        <CardBody>
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
              Recommended: Portrait · Min 600×700px · 3:4 ratio · JPG or WEBP ·
              Max 8MB
            </div>
          </div>

          {currentImage && (
            <div style={{ marginBottom: "20px" }}>
              <label className="field-label">Current Image</label>
              <div
                style={{
                  position: "relative",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  display: "inline-block",
                }}
              >
                <img
                  src={currentImage}
                  alt="Current about"
                  style={{
                    maxWidth: "240px",
                    maxHeight: "280px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    fontFamily: "'Lato',sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  🗑 {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}

          <div
            onClick={() => document.getElementById("about-file").click()}
            onDrop={(e) => {
              e.preventDefault();
              handleUpload(e.dataTransfer.files[0]);
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
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🛕</div>
            <div style={{ color: "var(--text-soft)", fontSize: "0.8rem" }}>
              {uploading
                ? "Uploading..."
                : currentImage
                  ? "Click or drag to replace image"
                  : "Click or drag image here"}
            </div>
            <input
              id="about-file"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleUpload(e.target.files[0])}
            />
          </div>

          <Feedback feedback={feedback} />
        </CardBody>
      </Card>
    </div>
  );
}
