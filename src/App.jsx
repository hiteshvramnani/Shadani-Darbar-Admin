import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import NoticeAdmin from "./NoticeAdmin";
import EventsAdmin from "./EventsAdmin";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const ALLOWED_EMAIL    = import.meta.env.VITE_ALLOWED_EMAIL;

export default function App() {
  const [user, setUser]       = useState(null);
  const [error, setError]     = useState(null);
  const [section, setSection] = useState("notice");

  const handleLogin = (cred) => {
    const decoded = jwtDecode(cred.credential);
    if (decoded.email !== ALLOWED_EMAIL) {
      setError("Access denied. This admin is restricted to authorised users only.");
      return;
    }
    setUser(decoded);
    setError(null);
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={{ minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Inter', sans-serif" }}>
        {!user ? (
          /* ── Login Screen ── */
          <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #0f0f0f 0%, #1a0a00 50%, #0f0f0f 100%)",
          }}>
            <div style={{
              background: "#1a1a1a", borderRadius: "20px", padding: "48px",
              border: "1px solid #2a2a2a", textAlign: "center",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              maxWidth: "400px", width: "90%",
            }}>
              {/* Logo area */}
              <div style={{
                width: "72px", height: "72px", borderRadius: "18px", margin: "0 auto 24px",
                background: "linear-gradient(135deg, #d4570a, #7a2800)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", boxShadow: "0 8px 24px rgba(212,87,10,0.4)",
              }}>🪔</div>

              <h1 style={{
                fontFamily: "'Georgia', serif", fontSize: "1.4rem",
                color: "#fff", margin: "0 0 4px", fontWeight: 700,
              }}>Shadani Darbar</h1>
              <p style={{ color: "#b8860b", fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 32px" }}>
                Admin Panel
              </p>

              {error && (
                <div style={{
                  background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)",
                  borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
                  color: "#ff6b6b", fontSize: "0.82rem",
                }}>
                  {error}
                </div>
              )}

              <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "24px" }}>
                Sign in with your authorised Google account to continue.
              </p>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  onSuccess={handleLogin}
                  onError={() => setError("Login failed. Please try again.")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="signin_with"
                />
              </div>
            </div>
          </div>
        ) : (
          /* ── Dashboard ── */
          <div style={{ display: "flex", minHeight: "100vh" }}>

            {/* Sidebar */}
            <div style={{
              width: "240px", background: "#141414", borderRight: "1px solid #222",
              display: "flex", flexDirection: "column", flexShrink: 0,
            }}>
              {/* Brand */}
              <div style={{ padding: "28px 24px", borderBottom: "1px solid #222" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #d4570a, #7a2800)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                  }}>🪔</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>Shadani Darbar</div>
                    <div style={{ color: "#b8860b", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase" }}>Admin</div>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav style={{ padding: "16px 12px", flex: 1 }}>
                {[
                  { id: "notice", icon: "📢", label: "Notice Ribbon" },
                  { id: "events", icon: "📅", label: "Events" },
                ].map(item => (
                  <button key={item.id} onClick={() => setSection(item.id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                    background: section === item.id ? "rgba(212,87,10,0.15)" : "transparent",
                    color: section === item.id ? "#d4570a" : "#888",
                    fontSize: "0.85rem", fontWeight: section === item.id ? 700 : 400,
                    marginBottom: "4px", textAlign: "left",
                    transition: "all 0.15s",
                    borderLeft: section === item.id ? "3px solid #d4570a" : "3px solid transparent",
                  }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* User */}
              <div style={{ padding: "16px", borderTop: "1px solid #222" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <img src={user.picture} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ color: "#fff", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                    <div style={{ color: "#555", fontSize: "0.68rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                  </div>
                </div>
                <button onClick={handleLogout} style={{
                  width: "100%", padding: "8px", borderRadius: "8px",
                  border: "1px solid #2a2a2a", background: "transparent",
                  color: "#666", fontSize: "0.78rem", cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#d4570a"; e.currentTarget.style.color = "#d4570a"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#666"; }}>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, overflow: "auto", background: "#0f0f0f" }}>
              {section === "notice" && <NoticeAdmin />}
              {section === "events" && <EventsAdmin />}
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
