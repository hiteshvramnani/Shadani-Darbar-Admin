import { useState, useEffect } from "react";

const WORKER_URL   = import.meta.env.VITE_WORKER_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

export default function AccessAdmin({ currentUserEmail }) {
  const [config,   setConfig]   = useState(null);
  const [emails,   setEmails]   = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetch(WORKER_URL + "/api/config")
      .then(r => r.json())
      .then(data => {
        setConfig(data.config || {});
        setEmails(data.config?.allowedEmails || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (newEmails) => {
    setSaving(true); setFeedback(null);
    try {
      const newConfig = { ...config, allowedEmails: newEmails };
      const res = await fetch(WORKER_URL + "/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + ADMIN_SECRET },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setConfig(newConfig);
      setEmails(newEmails);
      setFeedback({ ok: true, msg: "❖ Access list updated!" });
    } catch(e) {
      setFeedback({ ok: false, msg: "✕ " + e.message });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) { setFeedback({ ok: false, msg: "✕ Enter a valid email" }); setTimeout(() => setFeedback(null), 3000); return; }
    if (emails.includes(email)) { setFeedback({ ok: false, msg: "✕ Email already in list" }); setTimeout(() => setFeedback(null), 3000); return; }
    setNewEmail("");
    save([...emails, email]);
  };

  const removeEmail = (email) => {
    if (email === currentUserEmail) { setFeedback({ ok: false, msg: "✕ You cannot remove your own account" }); setTimeout(() => setFeedback(null), 3000); return; }
    if (!confirm("Remove " + email + " from admin access?")) return;
    save(emails.filter(e => e !== email));
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#5a3a1a", fontFamily: "Cinzel, serif", fontSize: "0.8rem", letterSpacing: "2px" }}>Loading...</div>
  );

  return (
    <div style={{ maxWidth: "720px" }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "0.85rem", color: "#faf5e8", fontWeight: 600, marginBottom: "2px" }}>Allowed Admins</div>
            <div style={{ fontSize: "0.72rem", color: "#5a3a1a" }}>{emails.length} account{emails.length !== 1 ? "s" : ""} with access</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && addEmail()} placeholder="Enter Google email address..." style={{ flex: 1 }} />
            <button onClick={addEmail} disabled={saving} style={{ background: "linear-gradient(135deg, #d4570a, #a83800)", border: "none", color: "white", borderRadius: "8px", padding: "0 20px", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Cinzel, serif", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>+ Add</button>
          </div>
          <div style={{ height: "1px", background: "linear-gradient(90deg, #3d2000, transparent)", marginBottom: "16px" }} />
          {emails.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#3d2000", fontSize: "0.82rem", fontFamily: "Cinzel, serif" }}>No emails added yet</div>
          )}
          {emails.map((email, i) => (
            <div key={i} style={{ background: "#110800", borderRadius: "10px", padding: "12px 16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #2a1000", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #d4570a, #a83800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "white", fontWeight: 700, flexShrink: 0 }}>
                  {email[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ color: "#faf5e8", fontSize: "0.82rem" }}>{email}</div>
                  {email === currentUserEmail && <div style={{ color: "#b8860b", fontSize: "0.65rem", marginTop: "2px", letterSpacing: "1px" }}>YOU</div>}
                </div>
              </div>
              <button onClick={() => removeEmail(email)} style={{ background: "rgba(184,134,11,0.1)", border: "1px solid rgba(184,134,11,0.2)", color: "#b8860b", borderRadius: "6px", padding: "4px 12px", fontSize: "0.68rem", cursor: "pointer", fontFamily: "Cinzel, serif", flexShrink: 0 }}>Remove</button>
            </div>
          ))}
          {feedback && <div className={feedback.ok ? "feedback-success" : "feedback-error"} style={{ marginTop: "12px" }}>{feedback.msg}</div>}
        </div>
      </div>
      <div style={{ marginTop: "16px", padding: "14px 16px", background: "#110800", borderRadius: "10px", border: "1px solid #2a1000" }}>
        <div style={{ fontSize: "0.72rem", color: "#5a3a1a", lineHeight: 1.7 }}>
          ⓘ Only Google accounts listed here can log in. Changes take effect immediately.
        </div>
      </div>
    </div>
  );
}
