import { useState, useEffect, useRef } from "react";
import { fetchConfig, saveConfig } from "../../lib/api";
import { uploadToSupabase } from "../../lib/supabase";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Feedback from "../../components/Feedback";

const BLANK_LOCATION = {
  id: "",
  city: "",
  state: "",
  address: "",
  mapsLink: "",
  emoji: "🛕",
  images: [],
};
const EMOJI_OPTIONS = ["🛕", "🕉️", "🪔", "🏛️", "🕌", "🙏", "⛪", "🗺️", "✨"];

async function uploadLocationImage(file, locationId) {
  return await uploadToSupabase(file, `locations/${locationId}`);
}

async function deleteLocationImage(url) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_KEY;
  const path = url.split("/object/public/media/")[1];
  if (!path) return;
  await fetch(`${base}/storage/v1/object/media/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${key}` },
  });
}

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
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchConfig()
      .then((cfg) => {
        setConfig(cfg || {});
        setLocations(cfg?.locations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (newLocations) => {
    setSaving(true);
    setFeedback(null);
    try {
      const newConfig = { locations: newLocations };
      await saveConfig(newConfig);
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
    const newLocations =
      editing === "new"
        ? [...locations, { ...loc, id: Date.now().toString() }]
        : locations.map((l, i) => (i === editing ? loc : l));
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
              All Locations
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-soft)" }}>
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
                color: "var(--border)",
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
                background: "var(--off-white)",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid var(--border)",
                gap: "12px",
              }}
            >
              {/* Image preview strip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {loc.images?.length > 0 ? (
                    <div style={{ display: "flex", gap: "3px" }}>
                      {loc.images.slice(0, 3).map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt=""
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            border: "1px solid var(--border)",
                          }}
                        />
                      ))}
                      {loc.images.length > 3 && (
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            background: "var(--cream)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-soft)",
                            fontSize: "0.65rem",
                          }}
                        >
                          +{loc.images.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: "1.6rem" }}>{loc.emoji}</span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: "var(--text-dark)",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    {loc.city}
                  </div>
                  <div
                    style={{
                      color: "var(--text-soft)",
                      fontSize: "0.72rem",
                      marginTop: "2px",
                    }}
                  >
                    {loc.state}
                  </div>
                  <div
                    style={{
                      color: "var(--border)",
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
              color: "var(--text-soft)",
              fontSize: "0.78rem",
              cursor: "pointer",
              fontFamily: "'Cinzel', serif",
              letterSpacing: "1px",
              transition: "all 0.15s",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--saffron)";
              e.currentTarget.style.color = "#d4570a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-soft)";
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

/* ── Location Modal with image upload ───────────────────────────── */
function LocationModal({ initial, emojiOptions, onSave, onCancel }) {
  const [loc, setLoc] = useState({
    ...BLANK_LOCATION,
    ...initial,
    images: initial.images || [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileRef = useRef();
  const set = (k, v) => setLoc((l) => ({ ...l, [k]: v }));

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setUploadMsg(null);
    const locId = loc.id || Date.now().toString();
    const uploaded = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setUploadMsg({ ok: false, msg: `${file.name} is not an image` });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setUploadMsg({ ok: false, msg: `${file.name} exceeds 10MB limit` });
          continue;
        }
        const url = await uploadLocationImage(file, locId);
        uploaded.push(url);
      }
      if (uploaded.length > 0) {
        setLoc((l) => ({ ...l, images: [...l.images, ...uploaded] }));
        setUploadMsg({
          ok: true,
          msg: `✦ ${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded!`,
        });
        setTimeout(() => setUploadMsg(null), 3000);
      }
    } catch (e) {
      setUploadMsg({ ok: false, msg: "✕ " + e.message });
    }
    setUploading(false);
  };

  const removeImage = async (idx) => {
    const url = loc.images[idx];
    await deleteLocationImage(url);
    setLoc((l) => ({ ...l, images: l.images.filter((_, i) => i !== idx) }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

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
                    loc.emoji === em
                      ? "rgba(212,87,10,0.3)"
                      : "var(--off-white)",
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

        {/* Image upload */}
        <div className="field">
          <label className="field-label">Location Images (carousel)</label>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              background: uploading ? "rgba(212,87,10,0.05)" : "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--saffron)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>📸</div>
            <div style={{ color: "var(--text-soft)", fontSize: "0.78rem" }}>
              {uploading ? "Uploading..." : "Click or drag images here"}
            </div>
            <div
              style={{
                color: "var(--border)",
                fontSize: "0.65rem",
                marginTop: "6px",
                lineHeight: 1.8,
              }}
            >
              JPG, PNG, WEBP · Max 10MB each
              <br />
              <span style={{ color: "var(--text-soft)" }}>
                Recommended: Landscape · Min 800×600px · 4:3 or 16:9 ratio
              </span>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />

          {uploadMsg && (
            <div
              className={uploadMsg.ok ? "feedback-success" : "feedback-error"}
              style={{ margin: "8px 0 0" }}
            >
              {uploadMsg.msg}
            </div>
          )}

          {/* Image previews */}
          {loc.images.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              {loc.images.map((url, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "80px",
                  }}
                >
                  <img
                    src={url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#d4570a",
                      border: "none",
                      color: "white",
                      fontSize: "0.6rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
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
            onClick={() => onSave(loc)}
            className="save-btn"
            style={{ flex: 1, padding: "11px" }}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Save Location"}
          </button>
        </div>
      </div>
    </div>
  );
}
