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
    setSaving(true); setFeedback(null);
    try {
      const newConfig = { ...config, notice: { show, text } };
      const res = await fetch(`${WORKER_URL}/api/admin/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ADMIN_SECRET}` },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setConfig(newConfig);
      setFeedback({ ok: true, msg: "✦ Notice updated successfully!" });
    } catch (e) {
      setFeedback({ ok: false, msg: "✕ " + e.message });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#5a3a1a", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", letterSpacing: "2px" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ maxWidth: "680px" }}>

      {/* Show/hide toggle card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.85rem", color: "#faf5e8", fontWeight: 600, marginBottom: "2px" }}>Show Notice Ribbon</div>
            <div style={{ fontSize: "0.72rem", color: "#5a3a1a" }}>Toggle visibility on the website</div>
          </div>
          <button
            className="toggle-btn"
            onClick={() => setShow(s => !s)}
            style={{ background: show ? "linear-gradient(135deg, #d4570a, #a83800)" : "#2a1000" }}
          >
            <div className="toggle-thumb" style={{ left: show ? "28px" : "4px" }} />
          </button>
        </div>
      </div>

      {/* Text input card */}
      <div className="card" style={{ opacity: show ? 1 : 0.4, transition: "opacity 0.2s" }}>
        <div className="card-header">
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.85rem", color: "#faf5e8", fontWeight: 600 }}>Notice Text</div>
          <span style={{ color: "#5a3a1a", fontSize: "0.72rem" }}>{text.length}/300</span>
        </div>
        <div className="card-body">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
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
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.85rem", color: "#faf5e8", fontWeight: 600 }}>Preview</div>
          </div>
          <div className="card-body">
            <div style={{
              background: "linear-gradient(90deg, #d4570a, #a83800)",
              borderRadius: "8px", padding: "10px 16px",
              display: "flex", alignItems: "center", gap: "12px", overflow: "hidden",
            }}>
              <span style={{
                background: "rgba(255,255,255,0.15)", borderRadius: "4px",
                padding: "2px 10px", color: "#fff", fontSize: "0.65rem",
                fontFamily: "'Cinzel', serif", letterSpacing: "2px", flexShrink: 0,
              }}>NOTICE</span>
              <span style={{ color: "#fff", fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
            </div>
          </div>
        </div>
      )}

      {feedback && <div className={feedback.ok ? "feedback-success" : "feedback-error"}>{feedback.msg}</div>}

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
