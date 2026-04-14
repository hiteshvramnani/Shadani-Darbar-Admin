import { useState, useEffect, useRef } from "react";
import { fetchConfig, saveConfig } from "../../lib/api";
import { uploadToSupabase } from "../../lib/supabase";

const BLANK_SEW = { id: "", name: "", city: "", contact: "", photo: "", show: true };

async function uploadPhoto(file, id) {
  return await uploadToSupabase(file, `sewadaris/${id}`);
}

async function deletePhoto(url) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  const key  = import.meta.env.VITE_SUPABASE_KEY;
  const path = url.split("/object/public/media/")[1];
  if (!path) return;
  await fetch(`${base}/storage/v1/object/media/${path}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${key}` },
  });
}

function Field({ label, children, span }) {
  return (
    <div className="field" style={span ? { gridColumn: "1/-1" } : {}}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

/* ── Sewadari Row ── */
function SewadariRow({ s, index, isFirst, isLast, onEdit, onDelete, onToggle, onMoveUp, onMoveDown }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
      {/* Reorder */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", flexShrink: 0 }}>
        {[{ a: "▲", d: isFirst, f: onMoveUp }, { a: "▼", d: isLast, f: onMoveDown }].map(({ a, d, f }) => (
          <button key={a} onClick={f} disabled={d} style={{
            width: "24px", height: "24px", border: "1px solid var(--border)",
            borderRadius: "4px", background: d ? "var(--cream)" : "white",
            color: d ? "var(--cream-dark)" : "var(--text-soft)",
            cursor: d ? "default" : "pointer", fontSize: "0.65rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{a}</button>
        ))}
      </div>

      {/* Card */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", gap: "14px",
        padding: "12px 16px", background: "#fff", borderRadius: "10px",
        border: "1px solid var(--border)", opacity: s.show === false ? 0.5 : 1,
        transition: "box-shadow 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(180,120,0,0.1)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
      >
        {/* Photo thumbnail */}
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
          overflow: "hidden", border: "2px solid var(--border)",
          background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {s.photo
            ? <img src={s.photo} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
            : <span style={{ fontSize: "1.2rem", opacity: 0.3 }}>🙏</span>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.85rem", color: "var(--text-dark)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {s.name || <span style={{ color: "var(--text-soft)" }}>Unnamed</span>}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-soft)", marginTop: "3px", display: "flex", gap: "10px" }}>
            {s.city && <span>📍 {s.city}</span>}
            {s.contact && <span>📞 {s.contact}</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button className="toggle-btn" onClick={onToggle}
            style={{ background: s.show !== false ? "linear-gradient(135deg,#d4570a,#a83800)" : "#bba98a" }}>
            <div className="toggle-thumb" style={{ left: s.show !== false ? "28px" : "4px" }} />
          </button>
          <button onClick={onEdit} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-soft)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Lato',sans-serif", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="var(--saffron)"; e.currentTarget.style.color="var(--saffron)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-soft)"; }}>Edit</button>
          <button onClick={onDelete} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(200,50,50,0.25)", background: "transparent", color: "#c83232", fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Lato',sans-serif", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(200,50,50,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal ── */
function SewadariModal({ initial, onSave, onCancel }) {
  const [s, setS]               = useState({ ...BLANK_SEW, ...initial });
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileRef = useRef();
  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadMsg({ ok: false, msg: "Please select an image file." }); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadMsg({ ok: false, msg: "Image must be under 5MB." }); return; }
    setUploading(true); setUploadMsg(null);
    try {
      const id  = s.id || Date.now().toString();
      const url = await uploadPhoto(file, id);
      set("photo", url);
      setUploadMsg({ ok: true, msg: "✦ Photo uploaded!" });
      setTimeout(() => setUploadMsg(null), 3000);
    } catch (err) {
      setUploadMsg({ ok: false, msg: "✕ " + err.message });
    }
    setUploading(false);
  };

  const removePhoto = async () => {
    if (s.photo) await deletePhoto(s.photo).catch(() => {});
    set("photo", "");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "520px", maxHeight: "92vh", overflow: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.2)", borderTop: "4px solid var(--saffron)" }}>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", color: "var(--text-dark)", margin: "0 0 24px", letterSpacing: "1px" }}>
          {initial?.name ? "✏️ Edit Sewadari" : "➕ Add Sewadari"}
        </h3>

        {/* Photo upload */}
        <div className="field">
          <label className="field-label">Photo</label>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Preview */}
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.photo
                ? <img src={s.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
                : <span style={{ fontSize: "1.8rem", opacity: 0.25 }}>🙏</span>
              }
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
              <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "white", color: "var(--text-mid)", fontSize: "0.78rem", cursor: uploading ? "not-allowed" : "pointer", fontFamily: "'Lato',sans-serif", fontWeight: 700 }}>
                {uploading ? "Uploading…" : s.photo ? "Change Photo" : "📷 Upload Photo"}
              </button>
              {s.photo && (
                <button onClick={removePhoto} style={{ padding: "6px 16px", borderRadius: "8px", border: "1px solid rgba(200,50,50,0.25)", background: "transparent", color: "#c83232", fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Lato',sans-serif" }}>
                  Remove
                </button>
              )}
            </div>
          </div>
          {uploadMsg && <div className={uploadMsg.ok ? "feedback-success" : "feedback-error"} style={{ marginTop: "8px" }}>{uploadMsg.msg}</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Full Name" span>
            <input value={s.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Ramesh Kumar" />
          </Field>
          <Field label="City">
            <input value={s.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Raipur" />
          </Field>
          <Field label="Contact Number">
            <input value={s.contact} onChange={e => set("contact", e.target.value)} placeholder="e.g. 9876543210" maxLength={15} />
          </Field>
        </div>

        {/* Preview card */}
        <div style={{ marginTop: "16px", padding: "16px", background: "var(--cream)", borderRadius: "12px", border: "1px solid var(--cream-dark)", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)", background: "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.photo ? <img src={s.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} /> : <span style={{ opacity: 0.2 }}>🙏</span>}
          </div>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.85rem", color: "var(--text-dark)", fontWeight: 600 }}>{s.name || "Sewadari Name"}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-soft)", marginTop: "2px" }}>
              {s.city && `📍 ${s.city}`}{s.city && s.contact && " · "}{s.contact && `📞 ${s.contact}`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button onClick={onCancel} disabled={uploading} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-soft)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Lato',sans-serif" }}>Cancel</button>
          <button onClick={() => onSave(s)} disabled={uploading} className="save-btn" style={{ flex: 2, padding: "11px" }}>
            {uploading ? "Uploading…" : "Save Sewadari"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function SewadarisAdmin() {
  const [sewadaris, setSewadaris] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [feedback, setFeedback]   = useState(null);
  const [editing, setEditing]     = useState(null);

  useEffect(() => {
    fetchConfig()
      .then(cfg => { setSewadaris(cfg.sewadaris || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const showFeedback = (ok, msg) => { setFeedback({ ok, msg }); setTimeout(() => setFeedback(null), 4000); };

  const handleSave = async (list = sewadaris) => {
    setSaving(true);
    try { await saveConfig({ sewadaris: list }); showFeedback(true, "✦ Sewadaris saved!"); }
    catch (e) { showFeedback(false, "✕ " + e.message); }
    setSaving(false);
  };

  const addOrUpdate = (s) => {
    const updated = editing === "new"
      ? [...sewadaris, { ...s, id: Date.now().toString() }]
      : sewadaris.map((item, i) => i === editing ? { ...s } : item);
    setSewadaris(updated);
    setEditing(null);
    handleSave(updated);
  };

  const deleteSewadari = async (index) => {
    if (!window.confirm("Delete this sewadari?")) return;
    const item = sewadaris[index];
    if (item.photo) await deletePhoto(item.photo).catch(() => {});
    const updated = sewadaris.filter((_, i) => i !== index);
    setSewadaris(updated);
    handleSave(updated);
  };

  const toggleShow = (index) => {
    const updated = sewadaris.map((s, i) => i === index ? { ...s, show: s.show === false ? true : false } : s);
    setSewadaris(updated);
  };

  const move = (index, dir) => {
    const next = [...sewadaris];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    setSewadaris(next);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: "var(--text-soft)", fontFamily: "'Cinzel',serif", fontSize: "0.8rem", letterSpacing: "2px" }}>Loading...</div>
  );

  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", gap: "16px" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--saffron)", marginBottom: "4px" }}>Sewadaris</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-soft)" }}>{sewadaris.length} sewadari{sewadaris.length !== 1 ? "s" : ""} listed</div>
        </div>
        <button className="save-btn" onClick={() => setEditing("new")} style={{ padding: "9px 20px", fontSize: "0.8rem", flexShrink: 0 }}>+ Add Sewadari</button>
      </div>

      {/* Empty */}
      {sewadaris.length === 0 && (
        <div style={{ textAlign: "center", padding: "52px 24px", background: "white", borderRadius: "14px", border: "2px dashed var(--cream-dark)", marginBottom: "20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🙏</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>No sewadaris yet. Click <strong>+ Add Sewadari</strong> to get started.</div>
        </div>
      )}

      {/* List */}
      {sewadaris.map((s, i) => (
        <SewadariRow key={s.id || i} s={s} index={i}
          isFirst={i === 0} isLast={i === sewadaris.length - 1}
          onEdit={() => setEditing(i)}
          onDelete={() => deleteSewadari(i)}
          onToggle={() => toggleShow(i)}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
        />
      ))}

      {feedback && <div className={feedback.ok ? "feedback-success" : "feedback-error"} style={{ marginTop: "12px" }}>{feedback.msg}</div>}

      {sewadaris.length > 0 && (
        <button className="save-btn" onClick={() => handleSave()} disabled={saving} style={{ marginTop: "12px" }}>
          {saving ? "Saving…" : "Save All Changes"}
        </button>
      )}

      {editing !== null && (
        <SewadariModal
          initial={editing === "new" ? BLANK_SEW : sewadaris[editing]}
          onSave={addOrUpdate}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
