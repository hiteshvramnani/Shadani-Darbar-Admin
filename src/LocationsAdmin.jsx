import { useState, useEffect } from "react";

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

const BLANK_LOCATION = {
  id: "",
  city: "",
  state: "",
  address: "",
  mapsLink: "",
  emoji: "🛕",
};

const EMOJI_OPTIONS = ["🛕", "🕉️", "🪔", "🏛️", "🕌", "🙏", "⛪", "🗺️", "✨"];

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function LocationsAdmin() {
  const [config, setConfig] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | index

  useEffect(() => {
    fetch(`${WORKER_URL}/api/config`)
      .then((r) => r.json())
      .then((data) => {
        setConfig(data.config || {});
        setLocations(data.config?.locations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (newLocations) => {
    setSaving(true);
    setFeedback(null);
    try {
      const newConfig = { ...config, locations: newLocations };
      const res = await fetch(`${WORKER_URL}/api/admin/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setConfig(newConfig);
      setLocations(newLocations);
      setFeedback({ ok: true, msg: "✦ Locations updated successfully!" });
    } catch (e) {
      setFeedback({ ok: false, msg: "✕ " + e.message });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const addOrUpdate = (loc) => {
    let newLocations;
    if (editing === "new") {
      newLocations = [...locations, { ...loc, id: Date.now().toString() }];
    } else {
      newLocations = locations.map((l, i) => (i === editing ? loc : l));
    }
    setEditing(null);
    save(newLocations);
  };

  const deleteLocation = (i) => {
    if (!confirm("Delete this location?")) return;
    save(locations.filter((_, idx) => idx !== i));
  };

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          color: "#5a3a1a",
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
      {/* Location list */}
      <div className="card">
        <div className="card-header">
          <div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.85rem",
                color: "#faf5e8",
                fontWeight: 600,
                marginBottom: "2px",
              }}
            >
              All Locations
            </div>
            <div style={{ fontSize: "0.72rem", color: "#5a3a1a" }}>
              {locations.length} location{locations.length !== 1 ? "s" : ""}{" "}
              listed
            </div>
          </div>
        </div>
        <div className="card-body">
          {locations.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
                color: "#3d2000",
                fontSize: "0.82rem",
                fontFamily: "'Cinzel', serif",
              }}
            >
              No locations added yet
            </div>
          )}
          {locations.map((loc, i) => (
            <div
              key={loc.id || i}
              style={{
                background: "#110800",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #2a1000",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>
                  {loc.emoji}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: "#faf5e8",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    {loc.city}
                  </div>
                  <div
                    style={{
                      color: "#5a3a1a",
                      fontSize: "0.72rem",
                      marginTop: "2px",
                    }}
                  >
                    {loc.state}
                  </div>
                  <div
                    style={{
                      color: "#3d2000",
                      fontSize: "0.68rem",
                      marginTop: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {loc.address}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                  onClick={() => setEditing(i)}
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
                  onClick={() => deleteLocation(i)}
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
            onClick={() => setEditing("new")}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "8px",
              border: "1px dashed #3d2000",
              background: "transparent",
              color: "#5a3a1a",
              fontSize: "0.78rem",
              cursor: "pointer",
              fontFamily: "'Cinzel', serif",
              letterSpacing: "1px",
              transition: "all 0.15s",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#d4570a";
              e.currentTarget.style.color = "#d4570a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#3d2000";
              e.currentTarget.style.color = "#5a3a1a";
            }}
          >
            + Add Location
          </button>
        </div>
      </div>

      {feedback && (
        <div className={feedback.ok ? "feedback-success" : "feedback-error"}>
          {feedback.msg}
        </div>
      )}

      {/* Modal */}
      {editing !== null && (
        <LocationModal
          initial={editing === "new" ? BLANK_LOCATION : locations[editing]}
          emojiOptions={EMOJI_OPTIONS}
          onSave={addOrUpdate}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function LocationModal({ initial, emojiOptions, onSave, onCancel }) {
  const [loc, setLoc] = useState({ ...BLANK_LOCATION, ...initial });
  const set = (k, v) => setLoc((l) => ({ ...l, [k]: v }));

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
          border: "1px solid #3d2000",
          width: "90%",
          maxWidth: "520px",
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
            color: "#faf5e8",
            margin: "0 0 24px",
            fontSize: "1rem",
            letterSpacing: "1px",
          }}
        >
          {initial?.city ? "Edit Location" : "Add New Location"}
        </h3>

        {/* Emoji picker */}
        <div className="field">
          <label className="field-label">Icon</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {emojiOptions.map((em) => (
              <button
                key={em}
                onClick={() => set("emoji", em)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    loc.emoji === em ? "rgba(212,87,10,0.3)" : "#110800",
                  outline:
                    loc.emoji === em
                      ? "2px solid #d4570a"
                      : "1px solid #3d2000",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 20px",
          }}
        >
          <Field label="City">
            <input
              value={loc.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Raipur"
            />
          </Field>
          <Field label="State">
            <input
              value={loc.state}
              onChange={(e) => set("state", e.target.value)}
              placeholder="e.g. Chhattisgarh"
            />
          </Field>
        </div>
        <Field label="Full Address">
          <textarea
            rows={2}
            value={loc.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Full address"
            style={{ resize: "vertical" }}
          />
        </Field>
        <Field label="Google Maps Link">
          <input
            value={loc.mapsLink}
            onChange={(e) => set("mapsLink", e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
          />
        </Field>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "8px",
              border: "1px solid #3d2000",
              background: "transparent",
              color: "#5a3a1a",
              fontSize: "0.82rem",
              cursor: "pointer",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(loc)}
            className="save-btn"
            style={{ flex: 1, padding: "11px" }}
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
}
