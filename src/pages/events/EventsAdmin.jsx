import { useState, useEffect } from "react";
import { fetchConfig, saveConfig } from "../../lib/api";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Toggle from "../../components/Toggle";
import Feedback from "../../components/Feedback";
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const BLANK_EVENT = {
  id: "",
  day: "",
  month: "JAN",
  year: "",
  date: "",
  title: "",
  desc: "",
  time: "",
  category: "Festival",
  boxBg: "linear-gradient(135deg, #d4570a, #c84a00)",
};
const DEFAULT_AARTI = [
  {
    id: "morning",
    icon: "🌅",
    title: "Morning Aarti",
    desc: "Begin your day with devotional aarti and prayers.",
    time: "7:00 AM – 8:00 AM",
    frequency: "Daily",
    category: "Daily Aarti",
    show: true,
    boxBg: "linear-gradient(135deg, #f07840, #d4570a)",
  },
  {
    id: "evening",
    icon: "🌙",
    title: "Evening Aarti",
    desc: "As the sun sets, join fellow devotees for the evening aarti.",
    time: "7:00 PM – 8:00 PM",
    frequency: "Daily",
    category: "Daily Aarti",
    show: true,
    boxBg: "linear-gradient(135deg, #3d2c8d, #6a4fcf)",
  },
];

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function EventsAdmin() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [editingUpcoming, setEditingUpcoming] = useState(null);
  const [activeTab, setActiveTab] = useState("featured");

  const [featured, setFeatured] = useState({
    show: true,
    day: "",
    month: "JAN",
    year: "",
    date: "",
    title: "",
    desc: "",
    time: "",
  });
  const [upcoming, setUpcoming] = useState({ show: true, events: [] });
  const [aarti, setAarti] = useState(DEFAULT_AARTI);

  useEffect(() => {
    fetchConfig()
      .then((cfg) => {
        setConfig(cfg);
        if (cfg.featuredEvent) setFeatured(cfg.featuredEvent);
        if (cfg.upcomingEvents) setUpcoming(cfg.upcomingEvents);
        if (cfg.aartiCards) setAarti(cfg.aartiCards);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (newConfig) => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveConfig(newConfig);
      setConfig(newConfig);
      setFeedback({ ok: true, msg: "✦ Saved successfully!" });
    } catch (e) {
      setFeedback({ ok: false, msg: "✕ " + e.message });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = () =>
    save({
      ...config,
      featuredEvent: featured,
      upcomingEvents: upcoming,
      aartiCards: aarti,
    });
  const addOrUpdateEvent = (ev) => {
    const events =
      editingUpcoming === "new"
        ? [...upcoming.events, { ...ev, id: Date.now().toString() }]
        : upcoming.events.map((e, i) => (i === editingUpcoming ? ev : e));
    setUpcoming((u) => ({ ...u, events }));
    setEditingUpcoming(null);
  };
  const deleteEvent = (i) =>
    setUpcoming((u) => ({
      ...u,
      events: u.events.filter((_, idx) => idx !== i),
    }));
  const updateAarti = (id, key, val) =>
    setAarti((a) =>
      a.map((item) => (item.id === id ? { ...item, [key]: val } : item)),
    );

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
    <div style={{ maxWidth: "800px" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {[
          ["featured", "Featured Event"],
          ["upcoming", "Upcoming Events"],
          ["aarti", "Daily Aarti"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── FEATURED ── */}
      {activeTab === "featured" && (
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
                Featured Event Hero
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-soft)" }}>
                Large banner with countdown timer at top of Events page
              </div>
            </div>
            <button
              className="toggle-btn"
              onClick={() => setFeatured((f) => ({ ...f, show: !f.show }))}
              style={{
                background: featured.show
                  ? "linear-gradient(135deg, #d4570a, #a83800)"
                  : "#bba98a",
              }}
            >
              <div
                className="toggle-thumb"
                style={{ left: featured.show ? "28px" : "4px" }}
              />
            </button>
          </div>
          {featured.show && (
            <div
              className="card-body"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 24px",
              }}
            >
              <Field label="Event Title">
                <input
                  value={featured.title}
                  onChange={(e) =>
                    setFeatured((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Event Title"
                />
              </Field>
              <Field label="Time">
                <input
                  value={featured.time}
                  onChange={(e) =>
                    setFeatured((f) => ({ ...f, time: e.target.value }))
                  }
                  placeholder="e.g. 9:00 AM onwards"
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={3}
                  value={featured.desc}
                  onChange={(e) =>
                    setFeatured((f) => ({ ...f, desc: e.target.value }))
                  }
                  placeholder="Event description..."
                  style={{ resize: "vertical" }}
                />
              </Field>
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <Field label="Day">
                    <input
                      value={featured.day}
                      maxLength={2}
                      onChange={(e) =>
                        setFeatured((f) => ({
                          ...f,
                          day: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="30"
                    />
                  </Field>
                  <Field label="Month">
                    <select
                      value={featured.month}
                      onChange={(e) =>
                        setFeatured((f) => ({ ...f, month: e.target.value }))
                      }
                    >
                      {MONTHS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Year">
                    <input
                      value={featured.year}
                      maxLength={4}
                      onChange={(e) =>
                        setFeatured((f) => ({
                          ...f,
                          year: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="2026"
                    />
                  </Field>
                </div>
                <Field label="Date (countdown)">
                  <input
                    type="date"
                    value={featured.date}
                    onChange={(e) =>
                      setFeatured((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── UPCOMING ── */}
      {activeTab === "upcoming" && (
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
                Upcoming Events Grid
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-soft)" }}>
                Card grid shown below the featured event
              </div>
            </div>
            <button
              className="toggle-btn"
              onClick={() => setUpcoming((u) => ({ ...u, show: !u.show }))}
              style={{
                background: upcoming.show
                  ? "linear-gradient(135deg, #d4570a, #a83800)"
                  : "#bba98a",
              }}
            >
              <div
                className="toggle-thumb"
                style={{ left: upcoming.show ? "28px" : "4px" }}
              />
            </button>
          </div>
          {upcoming.show && (
            <div className="card-body">
              {upcoming.events.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--border)",
                    fontSize: "0.82rem",
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  No upcoming events added yet
                </div>
              )}
              {upcoming.events.map((ev, i) => (
                <div
                  key={ev.id || i}
                  style={{
                    background: "var(--off-white)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "var(--text-dark)",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        fontFamily: "'Cinzel', serif",
                      }}
                    >
                      {ev.title || "Untitled"}
                    </div>
                    <div
                      style={{
                        color: "var(--text-soft)",
                        fontSize: "0.72rem",
                        marginTop: "3px",
                      }}
                    >
                      {ev.day} {ev.month} {ev.year} · {ev.time}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setEditingUpcoming(i)}
                      style={{
                        background: "rgba(212,87,10,0.15)",
                        border: "1px solid rgba(212,87,10,0.3)",
                        color: "#d4570a",
                        borderRadius: "6px",
                        padding: "5px 14px",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        fontFamily: "'Cinzel', serif",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(i)}
                      style={{
                        background: "rgba(184,134,11,0.1)",
                        border: "1px solid rgba(184,134,11,0.2)",
                        color: "#b8860b",
                        borderRadius: "6px",
                        padding: "5px 14px",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        fontFamily: "'Cinzel', serif",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setEditingUpcoming("new")}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "8px",
                  border: "1.5px dashed var(--border)",
                  background: "transparent",
                  color: "var(--text-soft)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "1px",
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
                + Add Event
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── AARTI ── */}
      {activeTab === "aarti" &&
        aarti.map((item) => (
          <div
            className="card"
            key={item.id}
            style={{
              opacity: item.show === false ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <div className="card-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "0.85rem",
                      color: "var(--text-dark)",
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--text-soft)",
                      letterSpacing: "1px",
                    }}
                  >
                    {item.frequency}
                  </div>
                </div>
              </div>
              <button
                className="toggle-btn"
                onClick={() =>
                  updateAarti(
                    item.id,
                    "show",
                    item.show === false ? true : false,
                  )
                }
                style={{
                  background:
                    item.show !== false
                      ? "linear-gradient(135deg, #d4570a, #a83800)"
                      : "#bba98a",
                }}
              >
                <div
                  className="toggle-thumb"
                  style={{ left: item.show !== false ? "28px" : "4px" }}
                />
              </button>
            </div>
            {item.show !== false && (
              <div
                className="card-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 24px",
                }}
              >
                <Field label="Title">
                  <input
                    value={item.title}
                    onChange={(e) =>
                      updateAarti(item.id, "title", e.target.value)
                    }
                  />
                </Field>
                <Field label="Time">
                  <input
                    value={item.time}
                    onChange={(e) =>
                      updateAarti(item.id, "time", e.target.value)
                    }
                    placeholder="e.g. 7:00 AM – 8:00 AM"
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={(e) =>
                      updateAarti(item.id, "desc", e.target.value)
                    }
                    style={{ resize: "vertical" }}
                  />
                </Field>
                <Field label="Frequency">
                  <input
                    value={item.frequency}
                    onChange={(e) =>
                      updateAarti(item.id, "frequency", e.target.value)
                    }
                  />
                </Field>
              </div>
            )}
          </div>
        ))}

      {/* Modal */}
      {editingUpcoming !== null && (
        <EventModal
          initial={
            editingUpcoming === "new"
              ? BLANK_EVENT
              : upcoming.events[editingUpcoming]
          }
          onSave={addOrUpdateEvent}
          onCancel={() => setEditingUpcoming(null)}
        />
      )}

      {feedback && (
        <div className={feedback.ok ? "feedback-success" : "feedback-error"}>
          {feedback.msg}
        </div>
      )}

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save All Changes"}
      </button>
    </div>
  );
}

function EventModal({ initial, onSave, onCancel }) {
  const [ev, setEv] = useState({ ...BLANK_EVENT, ...initial });
  const set = (k, v) => setEv((e) => ({ ...e, [k]: v }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "linear-gradient(160deg, #1e0a00 0%, #150600 100%)",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid var(--border)",
          width: "90%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #b8860b, transparent)",
          }}
        />
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            color: "var(--text-dark)",
            margin: "0 0 24px",
            fontSize: "1rem",
            letterSpacing: "1px",
          }}
        >
          {initial?.title ? "Edit Event" : "Add New Event"}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 20px",
          }}
        >
          <div style={{ gridColumn: "1/-1" }}>
            <div className="field">
              <label className="field-label">Title</label>
              <input
                value={ev.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Event title"
              />
            </div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <div className="field">
              <label className="field-label">Description</label>
              <textarea
                rows={3}
                value={ev.desc}
                onChange={(e) => set("desc", e.target.value)}
                placeholder="Description"
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Time</label>
            <input
              value={ev.time}
              onChange={(e) => set("time", e.target.value)}
              placeholder="9:00 AM onwards"
            />
          </div>
          <div className="field">
            <label className="field-label">Category</label>
            <input
              value={ev.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Festival"
            />
          </div>
          <div className="field">
            <label className="field-label">Day</label>
            <input
              value={ev.day}
              maxLength={2}
              onChange={(e) => set("day", e.target.value.replace(/\D/g, ""))}
              placeholder="30"
            />
          </div>
          <div className="field">
            <label className="field-label">Month</label>
            <select
              value={ev.month}
              onChange={(e) => set("month", e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Year</label>
            <input
              value={ev.year}
              maxLength={4}
              onChange={(e) => set("year", e.target.value.replace(/\D/g, ""))}
              placeholder="2026"
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-soft)",
              fontSize: "0.82rem",
              cursor: "pointer",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(ev)}
            className="save-btn"
            style={{ flex: 1, padding: "11px" }}
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
}
