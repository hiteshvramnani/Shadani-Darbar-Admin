import { useState, useEffect, useRef } from "react";

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const BUCKET = "media";

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

/* ── Upload image to Supabase R2 ─────────────────────────────────── */
async function uploadToSupabase(file, locationId) {
  const ext = file.name.split(".").pop();
  const filename = `locations/${locationId}/${Date.now()}.${ext}`;

  // First check if we can reach Supabase storage
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;
  console.log("Uploading to:", uploadUrl);
  console.log("Key starts with:", SUPABASE_KEY?.substring(0, 20));

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": file.type,
      "x-upsert": "true",
      apikey: SUPABASE_KEY,
    },
    body: file,
  });
  const text = await res.text();
  console.log("Supabase response:", res.status, text);
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try {
      msg = JSON.parse(text).message || msg;
    } catch {}
    throw new Error(msg);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

/* ── Delete image from Supabase ─────────────────────────────────── */
async function deleteFromSupabase(url) {
  const path = url.split(`/object/public/${BUCKET}/`)[1];
  if (!path) return;
  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
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
                            border: "1px solid #3d2000",
                          }}
                        />
                      ))}
                      {loc.images.length > 3 && (
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            background: "#2a1000",
                            border: "1px solid #3d2000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#5a3a1a",
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
        const url = await uploadToSupabase(file, locId);
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
    await deleteFromSupabase(url);
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
          border: "1px solid #3d2000",
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

        {/* Image upload */}
        <div className="field">
          <label className="field-label">Location Images (carousel)</label>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            style={{
              border: "2px dashed #3d2000",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              background: uploading ? "rgba(212,87,10,0.05)" : "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#d4570a")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#3d2000")
            }
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>📸</div>
            <div style={{ color: "#5a3a1a", fontSize: "0.78rem" }}>
              {uploading ? "Uploading..." : "Click or drag images here"}
            </div>
            <div
              style={{
                color: "#3d2000",
                fontSize: "0.65rem",
                marginTop: "4px",
              }}
            >
              JPG, PNG, WEBP · Max 10MB each
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
                      border: "1px solid #3d2000",
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
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Save Location"}
          </button>
        </div>
      </div>
    </div>
  );
}
