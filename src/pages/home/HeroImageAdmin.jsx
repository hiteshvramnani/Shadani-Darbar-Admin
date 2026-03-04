import { useState, useEffect } from "react";
import { fetchConfig, saveConfig } from "../../lib/api";
import { uploadToSupabase, deleteFromSupabase } from "../../lib/supabase";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Feedback from "../../components/Feedback";

export default function HeroImageAdmin() {
  const [currentImage, setCurrentImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchConfig().then((cfg) => {
      if (cfg?.heroImage) setCurrentImage(cfg.heroImage);
    });
  }, []);

  const flash = (ok, msg) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      flash(false, "File too large. Max 10MB.");
      return;
    }
    setUploading(true);
    try {
      // Delete old image from Supabase first if one exists
      if (currentImage) {
        try {
          await deleteFromSupabase(currentImage);
        } catch (_) {}
      }
      const url = await uploadToSupabase(file, "hero");
      await saveConfig({ heroImage: url });
      setCurrentImage(url);
      flash(true, "✦ Hero image updated!");
    } catch (e) {
      flash(false, "✕ " + e.message);
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!currentImage) return;
    if (
      !confirm(
        "Delete the current hero image? The site will fall back to the default.",
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteFromSupabase(currentImage);
      await saveConfig({ heroImage: null });
      setCurrentImage(null);
      flash(true, "✦ Hero image removed.");
    } catch (e) {
      flash(false, "✕ " + e.message);
    }
    setDeleting(false);
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <Card>
        <CardHeader
          title="Hero Banner Image"
          subtitle="Main banner shown at the top of the home page"
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
              Recommended: Landscape · Min 1920×640px · 3:1 ratio · JPG or WEBP
              · Max 10MB
            </div>
          </div>

          {/* Current image */}
          {currentImage && (
            <div style={{ marginBottom: "20px" }}>
              <label className="field-label">Current Image</label>
              <div
                style={{
                  position: "relative",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src={currentImage}
                  alt="Current hero"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
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

          {/* Upload new */}
          <div
            onClick={() => document.getElementById("hero-file").click()}
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
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🖼️</div>
            <div style={{ color: "var(--text-soft)", fontSize: "0.8rem" }}>
              {uploading
                ? "Uploading..."
                : currentImage
                  ? "Click or drag to replace image"
                  : "Click or drag image here"}
            </div>
            <input
              id="hero-file"
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
