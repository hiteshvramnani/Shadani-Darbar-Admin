import { useState, useEffect } from "react";
import { fetchConfig, saveConfig } from "../../lib/api";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Toggle from "../../components/Toggle";
import Feedback from "../../components/Feedback";

export default function NoticeAdmin() {
  const [text, setText] = useState("");
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchConfig()
      .then((cfg) => {
        const notice = cfg?.notice || {};
        setText(notice.text || "");
        setShow(notice.show !== false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveConfig({ notice: { show, text } });

      setFeedback({ ok: true, msg: "✦ Notice updated successfully!" });
    } catch (e) {
      setFeedback({ ok: false, msg: "✕ " + e.message });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          color: "var(--text-soft)",
          fontFamily: "'Cinzel', serif",
          fontSize: "0.8rem",
          letterSpacing: "2px",
        }}
      >
        Loading...
      </div>
    );

  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Show/hide toggle card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.85rem",
                color: "var(--text-dark)",
                fontWeight: 600,
                marginBottom: "2px",
              }}
            >
              Show Notice Ribbon
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-soft)" }}>
              Toggle visibility on the website
            </div>
          </div>
          <button
            className="toggle-btn"
            onClick={() => setShow((s) => !s)}
            style={{
              background: show
                ? "linear-gradient(135deg, #d4570a, #a83800)"
                : "#bba98a",
            }}
          >
            <div
              className="toggle-thumb"
              style={{
                left: show ? "28px" : "4px",
                background: show ? "white" : "var(--text-soft)",
              }}
            />
          </button>
        </div>
      </div>

      {/* Text input card */}
      <div
        className="card"
        style={{ opacity: show ? 1 : 0.4, transition: "opacity 0.2s" }}
      >
        <div className="card-header">
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.85rem",
              color: "var(--text-dark)",
              fontWeight: 600,
            }}
          >
            Notice Text
          </div>
          <span style={{ color: "var(--text-soft)", fontSize: "0.72rem" }}>
            {text.length}/300
          </span>
        </div>
        <div className="card-body">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!show}
            maxLength={300}
            rows={3}
            placeholder="e.g. 🙏 Welcome to Shadani Darbar, Raipur | ✨ | Cheti Chand Utsav on 30 March 2026"
          />
        </div>
      </div>

      {/* Preview card */}
      {show && text && (
        <div className="card">
          <div className="card-header">
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.85rem",
                color: "var(--text-dark)",
                fontWeight: 600,
              }}
            >
              Preview
            </div>
          </div>
          <div className="card-body">
            <div
              style={{
                background: "linear-gradient(90deg, #d4570a, #a83800)",
                borderRadius: "8px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "4px",
                  padding: "2px 10px",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "2px",
                  flexShrink: 0,
                }}
              >
                NOTICE
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {text}
              </span>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className={feedback.ok ? "feedback-success" : "feedback-error"}>
          {feedback.msg}
        </div>
      )}

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
