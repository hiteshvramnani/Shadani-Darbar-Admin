import { useState } from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { fetchConfig } from "./lib/api";

import NoticeAdmin from "./pages/home/NoticeAdmin";
import HeroImageAdmin from "./pages/home/HeroImageAdmin";
import LocationsAdmin from "./pages/home/LocationsAdmin";
import EventsAdmin from "./pages/events/EventsAdmin";
import AboutImageAdmin from "./pages/about/AboutImageAdmin";
import AboutContentAdmin from "./pages/about/AboutContentAdmin";
import AccessAdmin from "./pages/access/AccessAdmin";
import BhajanAdmin from "./pages/bhajan/BhajanAdmin";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const NAV = [
  {
    id: "home",
    icon: "🏠",
    label: "Home",
    subtitle: "Manage your home page content",
    tabs: ["Notice Ribbon", "Hero Image", "Locations"],
  },
  {
    id: "events",
    icon: "📅",
    label: "Events",
    subtitle: "Manage events & schedule",
    tabs: [],
  },
  {
    id: "bhajan",
    icon: "🎶",
    label: "Bhajan Corner",
    subtitle: "Manage bhajans & kirtans",
    tabs: [],
  },
  {
    id: "about",
    icon: "🛕",
    label: "About",
    subtitle: "Edit about page content",
    tabs: ["Page Image", "Page Content"],
  },
  {
    id: "access",
    icon: "🔐",
    label: "Access",
    subtitle: "Control admin access",
    tabs: [],
  },
];

function ShadaniLogo({ size = 48 }) {
  return (
    <img
      src="/logo.png"
      alt="Shadani Darbar"
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem("admin_user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(null);
  const [section, setSection] = useState("home");
  const [tab, setTab] = useState(0);

  const handleLogin = async (cred) => {
    const decoded = jwtDecode(cred.credential);
    try {
      const cfg = await fetchConfig();
      const allowed = cfg?.allowedEmails || [];
      const fallback = import.meta.env.VITE_ALLOWED_EMAIL;
      if (
        !allowed.includes(decoded.email.toLowerCase()) &&
        decoded.email !== fallback
      ) {
        setError(
          "Access denied. This admin is restricted to authorised users only.",
        );
        return;
      }
    } catch {
      setError("Could not verify access. Please try again.");
      return;
    }
    sessionStorage.setItem("admin_user", JSON.stringify(decoded));
    setUser(decoded);
    setError(null);
  };

  const handleLogout = () => {
    googleLogout();
    sessionStorage.removeItem("admin_user");
    setUser(null);
  };
  const switchSection = (id) => {
    setSection(id);
    setTab(0);
  };
  const currentNav = NAV.find((n) => n.id === section);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Lato',sans-serif; background:var(--cream); color:var(--text-dark); }
        :root {
          --saffron:#d4570a; --saffron-lt:#f07840;
          --gold:#b8860b; --gold-light:#daa520; --gold-pale:#fbf0d0;
          --cream:#faf5e8; --cream-dark:#f2e9d0; --cream-mid:#f7f0dc;
          --off-white:#fdfaf4;
          --text-dark:#1a1000; --text-mid:#3d2800; --text-soft:#7a5c30;
          --border:#e8d5a0;
          --sidebar-w:240px;
        }
        input, textarea, select {
          background: var(--off-white) !important; border: 1.5px solid var(--border) !important;
          border-radius: 8px !important; padding: 10px 13px !important;
          color: var(--text-dark) !important; font-family: 'Lato', sans-serif !important;
          font-size: 0.875rem !important; outline: none !important; width: 100% !important;
          box-sizing: border-box !important; transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        input:focus, textarea:focus, select:focus {
          border-color: var(--saffron) !important;
          box-shadow: 0 0 0 3px rgba(212,87,10,0.08) !important; background: #fff !important;
        }
        input::placeholder, textarea::placeholder { color: #b0956a !important; }
        select option { background: #fff; color: var(--text-dark); }
        .save-btn {
          background: linear-gradient(135deg, var(--saffron), #c84a00); color: white;
          border: none; border-radius: 10px; padding: 11px 30px; font-size: 0.85rem;
          font-weight: 700; cursor: pointer; letter-spacing: 0.5px;
          box-shadow: 0 4px 16px rgba(212,87,10,0.25); font-family: 'Lato', sans-serif; transition: all 0.2s;
        }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(212,87,10,0.35); }
        .save-btn:disabled { background: var(--cream-dark); color: var(--text-soft); box-shadow: none; cursor: not-allowed; transform: none; }
        .toggle-btn { width:52px; height:28px; border-radius:14px; border:none; position:relative; cursor:pointer; transition:background 0.2s; flex-shrink:0; }
        .toggle-thumb { width:20px; height:20px; border-radius:50%; background:white; position:absolute; top:4px; transition:left 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08); }
        .feedback-success { padding:11px 16px; border-radius:8px; margin:14px 0; background:rgba(46,107,31,0.08); border:1px solid rgba(46,107,31,0.2); color:#2e6b1f; font-size:0.82rem; }
        .feedback-error   { padding:11px 16px; border-radius:8px; margin:14px 0; background:rgba(212,87,10,0.08); border:1px solid rgba(212,87,10,0.2); color:var(--saffron); font-size:0.82rem; }
        .card { background:#fff; border-radius:14px; border:1px solid var(--border); margin-bottom:16px; overflow:hidden; box-shadow: 0 2px 12px rgba(180,120,0,0.06); }
        .card-header { padding:14px 22px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background:var(--cream); }
        .card-body { padding:22px; }
        .field-label { color:var(--text-soft); font-size:0.68rem; letter-spacing:1.5px; text-transform:uppercase; display:block; margin-bottom:6px; font-family:'Cinzel',serif; }
        .field { margin-bottom:18px; }
        .tab-btn { padding:8px 20px; border:none; background:transparent; font-family:'Cinzel',serif; font-size:0.72rem; letter-spacing:1px; cursor:pointer; transition:all 0.15s; border-bottom:2px solid transparent; color:var(--text-soft); }
        .tab-btn.active { color:var(--saffron); border-bottom-color:var(--saffron); }
        .tab-btn:not(.active):hover { color:var(--gold); }
        .nav-item { transition:all 0.15s; }
        .nav-item:hover  { background:rgba(212,87,10,0.06) !important; color:var(--saffron) !important; }
        .nav-item.active { background:rgba(212,87,10,0.1) !important; color:var(--saffron) !important; border-left:3px solid var(--saffron) !important; }
      `}</style>

      <div style={{ minHeight: "100vh" }}>
        {!user ? (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(160deg, var(--cream-dark) 0%, var(--cream) 60%)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background:
                  "linear-gradient(90deg, var(--saffron), var(--gold), var(--saffron))",
              }}
            />
            <div
              style={{
                background: "#fff",
                borderRadius: "24px",
                padding: "48px 44px",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 60px rgba(180,120,0,0.15)",
                textAlign: "center",
                maxWidth: "400px",
                width: "90%",
                borderTop: "4px solid var(--saffron)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <ShadaniLogo size={72} />
              </div>
              <h1
                style={{
                  fontFamily: "'Cinzel Decorative',serif",
                  fontSize: "1.2rem",
                  color: "var(--text-dark)",
                  marginBottom: "4px",
                }}
              >
                Shadani Darbar
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    height: "1px",
                    width: "28px",
                    background:
                      "linear-gradient(90deg,transparent,var(--gold))",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: "0.58rem",
                    letterSpacing: "4px",
                    color: "var(--gold)",
                    textTransform: "uppercase",
                  }}
                >
                  Admin Panel
                </span>
                <div
                  style={{
                    height: "1px",
                    width: "28px",
                    background:
                      "linear-gradient(90deg,var(--gold),transparent)",
                  }}
                />
              </div>
              <p
                style={{
                  color: "var(--text-soft)",
                  fontSize: "0.82rem",
                  lineHeight: 1.7,
                  margin: "20px 0 28px",
                }}
              >
                Sign in with your authorised Google account to access the admin
                panel.
              </p>
              {error && <div className="feedback-error">{error}</div>}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  onSuccess={handleLogin}
                  onError={() => setError("Login failed. Please try again.")}
                  theme="outline"
                  shape="pill"
                  size="large"
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <div
              style={{
                width: "var(--sidebar-w)",
                flexShrink: 0,
                background: "#fff",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                boxShadow: "2px 0 12px rgba(180,120,0,0.06)",
              }}
            >
              <div
                style={{
                  padding: "20px 16px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <ShadaniLogo size={40} />
                  <div
                    style={{
                      fontFamily: "'Cinzel Decorative',serif",
                      fontSize: "0.72rem",
                      color: "var(--saffron)",
                      lineHeight: 1.3,
                    }}
                  >
                    Shadani
                    <br />
                    Darbar
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: "0.55rem",
                    letterSpacing: "3px",
                    color: "var(--text-soft)",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Admin Panel
                </div>
              </div>

              <nav style={{ padding: "12px 10px", flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: "0.55rem",
                    letterSpacing: "2px",
                    color: "var(--border)",
                    textTransform: "uppercase",
                    padding: "0 8px 8px",
                  }}
                >
                  Navigation
                </div>
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => switchSection(item.id)}
                    className={`nav-item ${section === item.id ? "active" : ""}`}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontFamily: "'Lato',sans-serif",
                      fontWeight: section === item.id ? 700 : 400,
                      marginBottom: "3px",
                      textAlign: "left",
                      color:
                        section === item.id
                          ? "var(--saffron)"
                          : "var(--text-mid)",
                      background:
                        section === item.id
                          ? "rgba(212,87,10,0.08)"
                          : "transparent",
                      borderLeft:
                        section === item.id
                          ? "3px solid var(--saffron)"
                          : "3px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div
                style={{
                  padding: "14px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <img
                    src={user.picture}
                    alt=""
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "2px solid var(--border)",
                    }}
                  />
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <div
                      style={{
                        color: "var(--text-dark)",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      style={{
                        color: "var(--text-soft)",
                        fontSize: "0.62rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "7px",
                    borderRadius: "8px",
                    border: "1.5px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-soft)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontFamily: "'Lato',sans-serif",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--saffron)";
                    e.currentTarget.style.color = "var(--saffron)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-soft)";
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Main */}
            <div
              style={{ flex: 1, overflow: "auto", background: "var(--cream)" }}
            >
              <div
                style={{
                  padding: "14px 28px",
                  borderBottom: "1px solid var(--border)",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  boxShadow: "0 2px 8px rgba(180,120,0,0.06)",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: "0.95rem",
                      color: "var(--text-dark)",
                      fontWeight: 600,
                    }}
                  >
                    {currentNav?.icon} {currentNav?.label}
                  </h2>
                  <p
                    style={{
                      color: "var(--text-soft)",
                      fontSize: "0.7rem",
                      marginTop: "2px",
                    }}
                  >
                    {currentNav?.subtitle}
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(46,107,31,0.08)",
                    border: "1px solid rgba(46,107,31,0.2)",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#25d366",
                    }}
                  />
                  <span
                    style={{
                      color: "#2e6b1f",
                      fontSize: "0.68rem",
                      fontFamily: "'Cinzel',serif",
                      letterSpacing: "1px",
                    }}
                  >
                    LIVE
                  </span>
                </div>
              </div>

              {currentNav?.tabs?.length > 0 && (
                <div
                  style={{
                    background: "#fff",
                    borderBottom: "1px solid var(--border)",
                    padding: "0 28px",
                    display: "flex",
                    gap: "4px",
                  }}
                >
                  {currentNav.tabs.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setTab(i)}
                      className={`tab-btn ${tab === i ? "active" : ""}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ padding: "28px" }}>
                {section === "home" && tab === 0 && <NoticeAdmin />}
                {section === "home" && tab === 1 && <HeroImageAdmin />}
                {section === "home" && tab === 2 && <LocationsAdmin />}
                {section === "events" && <EventsAdmin />}
                {section === "bhajan" && <BhajanAdmin />}
                {section === "about" && tab === 0 && <AboutImageAdmin />}
                {section === "about" && tab === 1 && <AboutContentAdmin />}
                {section === "access" && (
                  <AccessAdmin currentUserEmail={user?.email} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
