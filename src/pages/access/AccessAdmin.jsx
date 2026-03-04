import { useState, useEffect } from "react";
import { fetchConfig, saveConfig } from "../../lib/api";
import Feedback from "../../components/Feedback";

export default function AccessAdmin({ currentUserEmail }) {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchConfig()
      .then((cfg) => {
        setEmails(cfg?.allowedEmails || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const flash = (ok, msg) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const save = async (newEmails) => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveConfig({ allowedEmails: newEmails });
      setEmails(newEmails);
      flash(true, "✦ Access list updated!");
    } catch (e) {
      flash(false, "✕ " + e.message);
    }
    setSaving(false);
  };

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      flash(false, "✕ Enter a valid email");
      return;
    }
    if (emails.includes(email)) {
      flash(false, "✕ Email already in list");
      return;
    }
    setNewEmail("");
    save([...emails, email]);
  };

  const removeEmail = (email) => {
    if (email === currentUserEmail) {
      flash(false, "✕ You cannot remove your own account");
      return;
    }
    if (!confirm("Remove " + email + " from admin access?")) return;
    save(emails.filter((e) => e !== email));
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
    <div style={{ maxWidth: "720px" }}>
      {/* ── Admin accounts card ── */}
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
              Allowed Admins
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-soft)" }}>
              {emails.length} account{emails.length !== 1 ? "s" : ""} with
              access
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Add email row */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEmail()}
              placeholder="Enter Google email address..."
              style={{ flex: 1 }}
            />
            <button
              onClick={addEmail}
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, var(--saffron), #a83800)",
                border: "none",
                color: "white",
                borderRadius: "8px",
                padding: "0 20px",
                fontSize: "0.78rem",
                cursor: "pointer",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
              }}
            >
              + Add
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, var(--border), transparent)",
              marginBottom: "16px",
            }}
          />

          {/* Empty state */}
          {emails.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
                color: "var(--text-soft)",
                fontSize: "0.82rem",
                fontFamily: "'Cinzel', serif",
              }}
            >
              No emails added yet
            </div>
          )}

          {/* Email list */}
          {emails.map((email, i) => (
            <div
              key={i}
              style={{
                background: "var(--off-white)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid var(--border)",
                gap: "12px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {/* Avatar circle */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--saffron), #a83800)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    color: "white",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {email[0].toUpperCase()}
                </div>
                <div>
                  <div
                    style={{ color: "var(--text-dark)", fontSize: "0.82rem" }}
                  >
                    {email}
                  </div>
                  {email === currentUserEmail && (
                    <div
                      style={{
                        color: "var(--saffron)",
                        fontSize: "0.65rem",
                        marginTop: "2px",
                        letterSpacing: "1px",
                      }}
                    >
                      YOU
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeEmail(email)}
                style={{
                  background: "rgba(212,87,10,0.08)",
                  border: "1px solid rgba(212,87,10,0.2)",
                  color: "var(--saffron)",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "0.68rem",
                  cursor: "pointer",
                  fontFamily: "'Cinzel', serif",
                  flexShrink: 0,
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <Feedback feedback={feedback} />
        </div>
      </div>

      {/* ── Info note ── */}
      <div
        style={{
          marginTop: "16px",
          padding: "14px 16px",
          background: "var(--cream)",
          borderRadius: "10px",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--text-soft)",
            lineHeight: 1.7,
          }}
        >
          ⓘ Only Google accounts listed here can log in to the admin panel.
          Changes take effect immediately.
        </div>
      </div>
    </div>
  );
}
