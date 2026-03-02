import { useState, useEffect } from "react";

const WORKER_URL   = import.meta.env.VITE_WORKER_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const BLANK_EVENT = {
  id: "", day: "", month: "JAN", year: "", date: "",
  title: "", desc: "", time: "", category: "Festival",
  boxBg: "linear-gradient(135deg, #d4570a, #c84a00)",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ color: "#aaa", fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#111", border: "1px solid #333",
  borderRadius: "8px", padding: "10px 12px", color: "#fff",
  fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

const selectStyle = { ...inputStyle };

const DEFAULT_AARTI = [
  { id: "morning", icon: "🌅", title: "Morning Aarti", desc: "Begin your day with devotional aarti and prayers. Start the morning with the divine blessings of Sant Shadaram Ji.", time: "7:00 AM – 8:00 AM", frequency: "Daily", category: "Daily Aarti", boxBg: "linear-gradient(135deg, #f07840, #d4570a)" },
  { id: "evening", icon: "🌙", title: "Evening Aarti", desc: "As the sun sets, join fellow devotees for the evening aarti. A peaceful end to the day with prayers and bhajans.", time: "7:00 PM – 8:00 PM", frequency: "Daily", category: "Daily Aarti", boxBg: "linear-gradient(135deg, #3d2c8d, #6a4fcf)" },
];

export default function EventsAdmin() {
  const [config,          setConfig]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [feedback,        setFeedback]        = useState(null);
  const [editingUpcoming, setEditingUpcoming] = useState(null);
  const [activeTab,       setActiveTab]       = useState("featured"); // featured | upcoming | aarti

  const [featured, setFeatured] = useState({ show: true, day: "", month: "JAN", year: "", date: "", title: "", desc: "", time: "" });
  const [upcoming, setUpcoming] = useState({ show: true, events: [] });
  const [aarti,    setAarti]    = useState(DEFAULT_AARTI);

  useEffect(() => {
    fetch(`${WORKER_URL}/api/config`)
      .then(r => r.json())
      .then(data => {
        const cfg = data.config || {};
        setConfig(cfg);
        if (cfg.featuredEvent)  setFeatured(cfg.featuredEvent);
        if (cfg.upcomingEvents) setUpcoming(cfg.upcomingEvents);
        if (cfg.aartiCards)     setAarti(cfg.aartiCards);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (newConfig) => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${WORKER_URL}/api/admin/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ADMIN_SECRET}` },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setConfig(newConfig);
      setFeedback({ ok: true, msg: "✅ Saved successfully!" });
    } catch (e) {
      setFeedback({ ok: false, msg: "❌ " + e.message });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = () => {
    save({ ...config, featuredEvent: featured, upcomingEvents: upcoming, aartiCards: aarti });
  };

  const addOrUpdateEvent = (ev) => {
    let events;
    if (editingUpcoming === "new") {
      events = [...upcoming.events, { ...ev, id: Date.now().toString() }];
    } else {
      events = upcoming.events.map((e, i) => i === editingUpcoming ? ev : e);
    }
    setUpcoming(u => ({ ...u, events }));
    setEditingUpcoming(null);
  };

  const deleteEvent = (i) => setUpcoming(u => ({ ...u, events: u.events.filter((_, idx) => idx !== i) }));

  const updateAarti = (id, key, val) => setAarti(a => a.map(item => item.id === id ? { ...item, [key]: val } : item));

  if (loading) return <div style={{ padding: "48px", color: "#555", textAlign: "center" }}>Loading...</div>;

  const tabStyle = (t) => ({
    padding: "8px 20px", borderRadius: "8px", border: "none",
    background: activeTab === t ? "rgba(212,87,10,0.2)" : "transparent",
    color: activeTab === t ? "#d4570a" : "#555",
    fontWeight: activeTab === t ? 700 : 400,
    fontSize: "0.82rem", cursor: "pointer",
    borderBottom: activeTab === t ? "2px solid #d4570a" : "2px solid transparent",
  });

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: "1.5rem", margin: "0 0 6px" }}>📅 Events</h2>
        <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>Manage all events shown on the Events page.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #222", paddingBottom: "0" }}>
        <button style={tabStyle("featured")} onClick={() => setActiveTab("featured")}>Featured Event</button>
        <button style={tabStyle("upcoming")} onClick={() => setActiveTab("upcoming")}>Upcoming Events</button>
        <button style={tabStyle("aarti")}    onClick={() => setActiveTab("aarti")}>Daily Aarti</button>
      </div>

      {/* ── FEATURED EVENT ── */}
      {activeTab === "featured" && (
        <div style={{ background: "#1a1a1a", borderRadius: "12px", border: "1px solid #2a2a2a", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>Featured Event Hero</div>
              <div style={{ color: "#555", fontSize: "0.75rem", marginTop: "2px" }}>The large banner at the top with countdown timer</div>
            </div>
            <button onClick={() => setFeatured(f => ({ ...f, show: !f.show }))} style={{
              width: "52px", height: "28px", borderRadius: "14px", border: "none",
              background: featured.show ? "#d4570a" : "#2a2a2a", cursor: "pointer",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "4px", left: featured.show ? "28px" : "4px", transition: "left 0.2s" }} />
            </button>
          </div>
          {featured.show && (
            <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              <Field label="Event Title">
                <input style={inputStyle} value={featured.title} onChange={e => setFeatured(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Cheti Chand Utsav 2026" />
              </Field>
              <Field label="Time">
                <input style={inputStyle} value={featured.time} onChange={e => setFeatured(f => ({ ...f, time: e.target.value }))} placeholder="e.g. 9:00 AM onwards" />
              </Field>
              <Field label="Description">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={featured.desc} onChange={e => setFeatured(f => ({ ...f, desc: e.target.value }))} placeholder="Event description..." />
              </Field>
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <Field label="Day"><input style={inputStyle} value={featured.day} maxLength={2} onChange={e => setFeatured(f => ({ ...f, day: e.target.value.replace(/\D/g,"") }))} placeholder="30" /></Field>
                  <Field label="Month">
                    <select style={selectStyle} value={featured.month} onChange={e => setFeatured(f => ({ ...f, month: e.target.value }))}>
                      {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Year"><input style={inputStyle} value={featured.year} maxLength={4} onChange={e => setFeatured(f => ({ ...f, year: e.target.value.replace(/\D/g,"") }))} placeholder="2026" /></Field>
                </div>
                <Field label="Date (for countdown)">
                  <input style={inputStyle} type="date" value={featured.date} onChange={e => setFeatured(f => ({ ...f, date: e.target.value }))} />
                </Field>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── UPCOMING EVENTS ── */}
      {activeTab === "upcoming" && (
        <div style={{ background: "#1a1a1a", borderRadius: "12px", border: "1px solid #2a2a2a", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>Upcoming Events Grid</div>
              <div style={{ color: "#555", fontSize: "0.75rem", marginTop: "2px" }}>Card grid shown below the featured event</div>
            </div>
            <button onClick={() => setUpcoming(u => ({ ...u, show: !u.show }))} style={{
              width: "52px", height: "28px", borderRadius: "14px", border: "none",
              background: upcoming.show ? "#d4570a" : "#2a2a2a", cursor: "pointer",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "4px", left: upcoming.show ? "28px" : "4px", transition: "left 0.2s" }} />
            </button>
          </div>
          {upcoming.show && (
            <div style={{ padding: "20px 24px" }}>
              {upcoming.events.length === 0 && (
                <div style={{ color: "#444", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>No upcoming events added yet.</div>
              )}
              {upcoming.events.map((ev, i) => (
                <div key={ev.id || i} style={{
                  background: "#111", borderRadius: "10px", padding: "14px 16px", marginBottom: "10px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #222",
                }}>
                  <div>
                    <div style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 600 }}>{ev.title || "Untitled"}</div>
                    <div style={{ color: "#555", fontSize: "0.75rem", marginTop: "2px" }}>{ev.day} {ev.month} {ev.year} · {ev.time}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setEditingUpcoming(i)} style={{ background: "rgba(212,87,10,0.15)", border: "1px solid rgba(212,87,10,0.3)", color: "#d4570a", borderRadius: "6px", padding: "5px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => deleteEvent(i)} style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", color: "#ff6b6b", borderRadius: "6px", padding: "5px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setEditingUpcoming("new")} style={{
                width: "100%", padding: "10px", borderRadius: "8px",
                border: "1px dashed #333", background: "transparent", color: "#555",
                fontSize: "0.82rem", cursor: "pointer", marginTop: "4px", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#d4570a"; e.currentTarget.style.color = "#d4570a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#555"; }}>
                + Add Event
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "aarti" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {aarti.map((item) => (
            <div key={item.id} style={{ background: "#1a1a1a", borderRadius: "12px", border: "1px solid #2a2a2a", overflow: "hidden", opacity: item.show === false ? 0.5 : 1, transition: "opacity 0.2s" }}>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>{item.title}</div>
                  <div style={{ color: "#555", fontSize: "0.72rem", marginLeft: "4px" }}>{item.frequency}</div>
                </div>
                {/* Show/hide toggle */}
                <button onClick={() => updateAarti(item.id, "show", item.show === false ? true : false)} style={{
                  width: "52px", height: "28px", borderRadius: "14px", border: "none",
                  background: item.show !== false ? "#d4570a" : "#2a2a2a", cursor: "pointer",
                  position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "4px", left: item.show !== false ? "28px" : "4px", transition: "left 0.2s" }} />
                </button>
              </div>
              {item.show !== false && (
                <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <Field label="Title">
                    <input style={inputStyle} value={item.title} onChange={e => updateAarti(item.id, "title", e.target.value)} />
                  </Field>
                  <Field label="Time">
                    <input style={inputStyle} value={item.time} onChange={e => updateAarti(item.id, "time", e.target.value)} placeholder="e.g. 7:00 AM – 8:00 AM" />
                  </Field>
                  <Field label="Description">
                    <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={item.desc} onChange={e => updateAarti(item.id, "desc", e.target.value)} />
                  </Field>
                  <Field label="Frequency">
                    <input style={inputStyle} value={item.frequency} onChange={e => updateAarti(item.id, "frequency", e.target.value)} placeholder="e.g. Daily" />
                  </Field>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Event Modal ── */}
      {editingUpcoming !== null && (
        <EventModal
          initial={editingUpcoming === "new" ? BLANK_EVENT : upcoming.events[editingUpcoming]}
          onSave={addOrUpdateEvent}
          onCancel={() => setEditingUpcoming(null)}
        />
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{
          padding: "12px 16px", borderRadius: "8px", margin: "20px 0",
          background: feedback.ok ? "rgba(37,211,102,0.1)" : "rgba(255,60,60,0.1)",
          border: feedback.ok ? "1px solid rgba(37,211,102,0.3)" : "1px solid rgba(255,60,60,0.3)",
          color: feedback.ok ? "#25d366" : "#ff6b6b", fontSize: "0.85rem",
        }}>
          {feedback.msg}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} style={{
        background: saving ? "#333" : "linear-gradient(135deg, #d4570a, #a83800)",
        color: "#fff", border: "none", borderRadius: "10px",
        padding: "13px 32px", fontSize: "0.88rem", fontWeight: 700,
        cursor: saving ? "not-allowed" : "pointer", marginTop: "20px",
        boxShadow: saving ? "none" : "0 4px 16px rgba(212,87,10,0.35)",
      }}>
        {saving ? "Saving..." : "Save All Changes"}
      </button>
    </div>
  );
}

function EventModal({ initial, onSave, onCancel }) {
  const [ev, setEv] = useState({ ...BLANK_EVENT, ...initial });
  const set = (k, v) => setEv(e => ({ ...e, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "32px", border: "1px solid #2a2a2a", width: "90%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}>
        <h3 style={{ color: "#fff", margin: "0 0 24px", fontSize: "1.1rem" }}>
          {initial?.title ? "Edit Event" : "Add New Event"}
        </h3>
        <Field label="Title"><input style={inputStyle} value={ev.title} onChange={e => set("title", e.target.value)} placeholder="Event title" /></Field>
        <Field label="Description"><textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={ev.desc} onChange={e => set("desc", e.target.value)} placeholder="Event description" /></Field>
        <Field label="Time"><input style={inputStyle} value={ev.time} onChange={e => set("time", e.target.value)} placeholder="e.g. 9:00 AM onwards" /></Field>
        <Field label="Category"><input style={inputStyle} value={ev.category} onChange={e => set("category", e.target.value)} placeholder="e.g. Festival, Program" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <Field label="Day"><input style={inputStyle} value={ev.day} maxLength={2} onChange={e => set("day", e.target.value.replace(/\D/g,""))} placeholder="30" /></Field>
          <Field label="Month"><select style={selectStyle} value={ev.month} onChange={e => set("month", e.target.value)}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select></Field>
          <Field label="Year"><input style={inputStyle} value={ev.year} maxLength={4} onChange={e => set("year", e.target.value.replace(/\D/g,""))} placeholder="2026" /></Field>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid #333", background: "transparent", color: "#666", fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(ev)} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #d4570a, #a83800)", color: "#fff", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>Save Event</button>
        </div>
      </div>
    </div>
  );
}
