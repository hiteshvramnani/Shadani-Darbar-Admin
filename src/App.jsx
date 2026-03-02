import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import NoticeAdmin from "./NoticeAdmin";
import EventsAdmin from "./EventsAdmin";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const ALLOWED_EMAIL    = import.meta.env.VITE_ALLOWED_EMAIL;

// Shadani Darbar Logo
function ShadaniLogo({ size = 48 }) {
  return (
    <img src="/logo.png" alt="Shadani Darbar" style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(184,134,11,0.4))" }} />
  );
}


export default function App() {
  const [user,    setUser]    = useState(null);
  const [error,   setError]   = useState(null);
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

  const handleLogout = () => { googleLogout(); setUser(null); };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; }
        :root {
          --saffron: #d4570a;
          --saffron-lt: #f07840;
          --gold: #b8860b;
          --gold-light: #daa520;
          --cream: #faf5e8;
          --cream-dark: #f2e9d0;
          --dark: #1a0800;
          --dark-mid: #2d1200;
          --dark-card: #221000;
          --dark-border: #3d2000;
          --text-muted: #8b6030;
        }
        .nav-item { transition: all 0.15s; }
        .nav-item:hover { background: rgba(212,87,10,0.08) !important; color: #d4570a !important; }
        .nav-item.active { background: rgba(212,87,10,0.15) !important; color: #d4570a !important; border-left: 3px solid #d4570a !important; }
        input, textarea, select {
          background: #110800 !important;
          border: 1px solid #3d2000 !important;
          border-radius: 8px !important;
          padding: 10px 12px !important;
          color: #faf5e8 !important;
          font-family: 'Lato', sans-serif !important;
          font-size: 0.875rem !important;
          outline: none !important;
          width: 100% !important;
          box-sizing: border-box !important;
          transition: border-color 0.2s !important;
        }
        input:focus, textarea:focus, select:focus {
          border-color: #d4570a !important;
          box-shadow: 0 0 0 3px rgba(212,87,10,0.12) !important;
        }
        input::placeholder, textarea::placeholder { color: #5a3a1a !important; }
        select option { background: #1a0800; color: #faf5e8; }
        .save-btn {
          background: linear-gradient(135deg, #d4570a, #a83800);
          color: white; border: none; border-radius: 10px;
          padding: 12px 32px; font-size: 0.875rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.5px;
          box-shadow: 0 4px 20px rgba(212,87,10,0.35);
          font-family: 'Lato', sans-serif;
          transition: all 0.2s;
        }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(212,87,10,0.45); }
        .save-btn:disabled { background: #3d2000; box-shadow: none; cursor: not-allowed; transform: none; }
        .toggle-btn {
          width: 52px; height: 28px; border-radius: 14px; border: none;
          position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0;
        }
        .toggle-thumb {
          width: 20px; height: 20px; border-radius: 50%; background: white;
          position: absolute; top: 4px; transition: left 0.2s;
        }
        .feedback-success {
          padding: 12px 16px; border-radius: 8px; margin: 16px 0;
          background: rgba(184,134,11,0.12); border: 1px solid rgba(184,134,11,0.3);
          color: #daa520; font-size: 0.85rem;
        }
        .feedback-error {
          padding: 12px 16px; border-radius: 8px; margin: 16px 0;
          background: rgba(212,87,10,0.12); border: 1px solid rgba(212,87,10,0.3);
          color: #f07840; font-size: 0.85rem;
        }
        .card {
          background: #1e0e00; border-radius: 14px;
          border: 1px solid #3d2000; margin-bottom: 16px; overflow: hidden;
        }
        .card-header {
          padding: 16px 24px; border-bottom: 1px solid #3d2000;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(212,87,10,0.04);
        }
        .card-body { padding: 24px; }
        .field-label {
          color: #8b6030; font-size: 0.7rem; letter-spacing: 1.5px;
          text-transform: uppercase; display: block; margin-bottom: 6px;
          font-family: 'Cinzel', serif;
        }
        .field { margin-bottom: 18px; }
        .tab-btn {
          padding: 8px 18px; border: none; background: transparent;
          font-family: 'Cinzel', serif; font-size: 0.75rem; letter-spacing: 1px;
          cursor: pointer; transition: all 0.15s;
          border-bottom: 2px solid transparent;
        }
        .tab-btn.active { color: #d4570a; border-bottom-color: #d4570a; }
        .tab-btn:not(.active) { color: #5a3a1a; }
        .tab-btn:not(.active):hover { color: #b8860b; }
        /* Ornamental divider */
        .ornament { text-align: center; color: #3d2000; font-size: 0.7rem; letter-spacing: 4px; margin: 8px 0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0f0500" }}>
        {!user ? (
          /* ── Login Screen ── */
          <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(ellipse at 50% 0%, #3d1400 0%, #0f0500 60%)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative background circles */}
            <div style={{ position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,87,10,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-50px", left: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(184,134,11,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{
              background: "linear-gradient(160deg, #1e0a00 0%, #150600 100%)",
              borderRadius: "24px", padding: "48px 44px",
              border: "1px solid #3d2000",
              boxShadow: "0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,87,10,0.1)",
              textAlign: "center", maxWidth: "420px", width: "90%",
              position: "relative",
            }}>
              {/* Top gold line */}
              <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "2px", background: "linear-gradient(90deg, transparent, #b8860b, transparent)", borderRadius: "2px" }} />

              {/* Logo */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <ShadaniLogo size={80} />
              </div>

              {/* Brand name */}
              <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.3rem", color: "#faf5e8", marginBottom: "4px", letterSpacing: "0.05em" }}>
                Shadani Darbar
              </h1>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ height: "1px", width: "30px", background: "linear-gradient(90deg, transparent, #b8860b)" }} />
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "4px", color: "#b8860b", textTransform: "uppercase" }}>Admin Panel</span>
                <div style={{ height: "1px", width: "30px", background: "linear-gradient(90deg, #b8860b, transparent)" }} />
              </div>
              <div className="ornament">✦ ✦ ✦</div>

              <p style={{ color: "#5a3a1a", fontSize: "0.82rem", lineHeight: 1.6, margin: "20px 0 28px" }}>
                Sign in with your authorised Google account to access the admin panel.
              </p>

              {error && <div className="feedback-error">{error}</div>}

              <div style={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  onSuccess={handleLogin}
                  onError={() => setError("Login failed. Please try again.")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                />
              </div>

              {/* Bottom gold line */}
              <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: "1px", background: "linear-gradient(90deg, transparent, #3d2000, transparent)" }} />
            </div>
          </div>
        ) : (
          /* ── Dashboard ── */
          <div style={{ display: "flex", minHeight: "100vh" }}>

            {/* ── Sidebar ── */}
            <div style={{
              width: "256px", flexShrink: 0,
              background: "linear-gradient(180deg, #170800 0%, #0f0500 100%)",
              borderRight: "1px solid #3d2000",
              display: "flex", flexDirection: "column",
            }}>
              {/* Brand */}
              <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #3d2000" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <ShadaniLogo size={44} />
                  <div>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.78rem", color: "#faf5e8", lineHeight: 1.3 }}>Shadani<br/>Darbar</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, #3d2000, transparent)" }} />
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "3px", color: "#5a3a1a", textTransform: "uppercase" }}>Admin Panel</span>
                  <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, #3d2000)" }} />
                </div>
              </div>

              {/* Nav */}
              <nav style={{ padding: "16px 12px", flex: 1 }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "2px", color: "#3d2000", textTransform: "uppercase", padding: "0 8px 8px" }}>Navigation</div>
                {[
                  { id: "notice", icon: "📢", label: "Notice Ribbon" },
                  { id: "events", icon: "📅", label: "Events" },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`nav-item ${section === item.id ? "active" : ""}`}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 12px", borderRadius: "8px", border: "none",
                      cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Lato', sans-serif",
                      fontWeight: section === item.id ? 700 : 400,
                      marginBottom: "4px", textAlign: "left",
                      color: section === item.id ? "#d4570a" : "#7a5030",
                      background: section === item.id ? "rgba(212,87,10,0.12)" : "transparent",
                      borderLeft: section === item.id ? "3px solid #d4570a" : "3px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* User info */}
              <div style={{ padding: "16px", borderTop: "1px solid #3d2000" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <img src={user.picture} alt="" style={{ width: "34px", height: "34px", borderRadius: "50%", border: "2px solid #3d2000" }} />
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <div style={{ color: "#faf5e8", fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                    <div style={{ color: "#5a3a1a", fontSize: "0.65rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                  </div>
                </div>
                <button onClick={handleLogout} style={{
                  width: "100%", padding: "8px", borderRadius: "8px",
                  border: "1px solid #3d2000", background: "transparent",
                  color: "#5a3a1a", fontSize: "0.75rem", cursor: "pointer",
                  fontFamily: "'Lato', sans-serif", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#d4570a"; e.currentTarget.style.color = "#d4570a"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#3d2000"; e.currentTarget.style.color = "#5a3a1a"; }}>
                  Sign Out
                </button>
              </div>
            </div>

            {/* ── Main Content ── */}
            <div style={{ flex: 1, overflow: "auto", background: "#0f0500" }}>
              {/* Top bar */}
              <div style={{
                padding: "16px 32px", borderBottom: "1px solid #3d2000",
                background: "rgba(30,10,0,0.8)", backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                position: "sticky", top: 0, zIndex: 10,
              }}>
                <div>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "#faf5e8", fontWeight: 600 }}>
                    {section === "notice" ? "📢 Notice Ribbon" : "📅 Events"}
                  </h2>
                  <p style={{ color: "#5a3a1a", fontSize: "0.72rem", marginTop: "2px" }}>
                    {section === "notice" ? "Control the scrolling notice bar" : "Manage events on the website"}
                  </p>
                </div>
                <div style={{
                  background: "rgba(212,87,10,0.1)", border: "1px solid rgba(212,87,10,0.2)",
                  borderRadius: "20px", padding: "4px 12px",
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#25d366" }} />
                  <span style={{ color: "#b8860b", fontSize: "0.7rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>LIVE</span>
                </div>
              </div>

              <div style={{ padding: "32px" }}>
                {section === "notice" && <NoticeAdmin />}
                {section === "events" && <EventsAdmin />}
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
