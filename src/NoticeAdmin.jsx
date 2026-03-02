import { useState, useEffect } from "react";

const WORKER_URL   = import.meta.env.VITE_WORKER_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

export default function NoticeAdmin() {
  const [config,   setConfig]   = useState(null);
  const [text,     setText]     = useState("");
  const [show,     setShow]     = useState(true);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Load current config
  useEffect(() => {
    fetch(`${WORKER_URL}/api/config`)
      .then(r => r.json())
      .then(data => {
        const notice = data.config?.notice || {};
        setText(notice.text || "");
        setShow(notice.show !== false);
        setConfig(data.config);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const newConfig = {
        ...config,
        notice: { show, text },
      };
      const res = await fetch(`${WORKER_URL}/api/admin/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ADMIN_SECRET}`,
        },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setConfig(newConfig);
      setFeedback({ ok: true, msg: "✅ Notice updated successfully!" });
    } catch (e) {
      setFeedback({ ok: false, msg: "❌ " + e.message });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) return (
    <div style={{ padding: "48px", color: "#555", textAlign: "center" }}>Loading...</div>
  );

  return (
    <div style={{ padding: "40px", maxWidth: "720px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: "1.5rem", margin: "0 0 6px" }}>
          📢 Notice Ribbon
        </h2>
        <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>
          Control the scrolling notice bar shown at the top of the website.
        </p>
      </div>

      {/* Show/Hide toggle */}
      <div style={{
        background: "#1a1a1a", borderRadius: "12px", padding: "20px 24px",
        border: "1px solid #2a2a2a", marginBottom: "16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600, marginBottom: "2px" }}>Show Notice Ribbon</div>
          <div style={{ color: "#555", fontSize: "0.78rem" }}>Toggle visibility on the website</div>
        </div>
        <button onClick={() => setShow(s => !s)} style={{
          width: "52px", height: "28px", borderRadius: "14px", border: "none",
          background: show ? "#d4570a" : "#2a2a2a", cursor: "pointer",
          position: "relative", transition: "background 0.2s",
        }}>
          <div style={{
            width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
            position: "absolute", top: "4px",
            left: show ? "28px" : "4px",
            transition: "left 0.2s",
          }} />
        </button>
      </div>

      {/* Text input */}
      <div style={{
        background: "#1a1a1a", borderRadius: "12px", padding: "20px 24px",
        border: "1px solid #2a2a2a", marginBottom: "24px",
        opacity: show ? 1 : 0.4, transition: "opacity 0.2s",
      }}>
        <label style={{ color: "#aaa", fontSize: "0.78rem", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
          Notice Text
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={!show}
          maxLength={300}
          rows={3}
          placeholder="e.g. 🙏 Welcome to Shadani Darbar, Raipur | ✨ | Cheti Chand Utsav on 30 March 2026"
          style={{
            width: "100%", background: "#111", border: "1px solid #333",
            borderRadius: "8px", padding: "12px", color: "#fff",
            fontSize: "0.88rem", lineHeight: 1.6, resize: "vertical",
            outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
        <div style={{ color: "#444", fontSize: "0.72rem", marginTop: "6px", textAlign: "right" }}>
          {text.length}/300
        </div>
      </div>

      {/* Preview */}
      {show && text && (
        <div style={{
          background: "#1a1a1a", borderRadius: "12px", padding: "20px 24px",
          border: "1px solid #2a2a2a", marginBottom: "24px",
        }}>
          <label style={{ color: "#aaa", fontSize: "0.78rem", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
            Preview
          </label>
          <div style={{
            background: "#d4570a", borderRadius: "8px", padding: "10px 16px",
            display: "flex", alignItems: "center", gap: "12px", overflow: "hidden",
          }}>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "4px", padding: "2px 8px", color: "#fff", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>NOTICE</span>
            <span style={{ color: "#fff", fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{
          padding: "12px 16px", borderRadius: "8px", marginBottom: "16px",
          background: feedback.ok ? "rgba(37,211,102,0.1)" : "rgba(255,60,60,0.1)",
          border: feedback.ok ? "1px solid rgba(37,211,102,0.3)" : "1px solid rgba(255,60,60,0.3)",
          color: feedback.ok ? "#25d366" : "#ff6b6b", fontSize: "0.85rem",
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Save button */}
      <button onClick={handleSave} disabled={saving} style={{
        background: saving ? "#333" : "linear-gradient(135deg, #d4570a, #a83800)",
        color: "#fff", border: "none", borderRadius: "10px",
        padding: "13px 32px", fontSize: "0.88rem", fontWeight: 700,
        cursor: saving ? "not-allowed" : "pointer",
        letterSpacing: "0.5px", transition: "opacity 0.2s",
        boxShadow: saving ? "none" : "0 4px 16px rgba(212,87,10,0.35)",
      }}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
