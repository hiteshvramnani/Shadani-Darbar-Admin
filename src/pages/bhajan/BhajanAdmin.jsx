import { useState, useEffect, useRef } from "react";
import { fetchConfig, saveConfig } from "../../lib/api";

const CATEGORIES = ["Aarti", "Kirtan", "Bhajan", "Collection", "Festival", "Prayer", "Other"];
const LANGUAGES  = ["Sindhi", "Hindi", "Sanskrit", "Punjabi", "Other"];
const TYPES      = ["MP3", "YouTube", "SoundCloud", "Other"];

const ARCHIVE_ACCESS = import.meta.env.VITE_ARCHIVE_ACCESS_KEY;
const ARCHIVE_SECRET = import.meta.env.VITE_ARCHIVE_SECRET_KEY;

const BG_PRESETS = [
  "linear-gradient(135deg, #7B0D1E 0%, #d4570a 100%)",
  "linear-gradient(135deg, #1B4A2F 0%, #b8860b 100%)",
  "linear-gradient(135deg, #0D3461 0%, #d4570a 100%)",
  "linear-gradient(135deg, #3d1f00 0%, #b8860b 100%)",
  "linear-gradient(135deg, #5c0a00 0%, #f07840 100%)",
  "linear-gradient(135deg, #1a2a00 0%, #daa520 100%)",
  "linear-gradient(135deg, #2a0845 0%, #d4570a 100%)",
  "linear-gradient(135deg, #003333 0%, #b8860b 100%)",
];

const BLANK_BHAJAN = {
  id: "", title: "", artist: "", duration: "",
  language: "Sindhi", category: "Bhajan", type: "MP3",
  url: "", archiveId: "", emoji: "🎶", bg: BG_PRESETS[0], show: true,
};

async function uploadToArchive({ file, title, artist, category, language, onProgress }) {
  // 🔐 Ensure header-safe encoding (ISO-8859-1 compatible)
  const safe = (str) =>
    unescape(encodeURIComponent(str || "")).slice(0, 255);

  const sanitise = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const identifier = `shadani-darbar-${sanitise(category)}-${sanitise(title)}-${Date.now()}`;

  // ⚠️ also sanitize filename (important)
  const filename = (file.name || "audio.mp3")
    .replace(/\s+/g, "_")
    .replace(/[^\x00-\x7F]/g, ""); // remove unicode from filename too

  const uploadUrl = `https://s3.us.archive.org/${identifier}/${filename}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 📊 Progress tracking
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && typeof onProgress === "function") {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    // ✅ Success
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          url: `https://archive.org/download/${identifier}/${filename}`,
          archiveId: identifier,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    // ❌ Error handling
    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload"))
    );

    xhr.open("PUT", uploadUrl);

    // 🔑 AUTH
    xhr.setRequestHeader(
      "Authorization",
      `LOW ${ARCHIVE_ACCESS}:${ARCHIVE_SECRET}`
    );

    // 📦 FILE TYPE
    xhr.setRequestHeader("Content-Type", file.type || "audio/mpeg");

    // 🧠 METADATA (FIXED: all encoded safely)
    xhr.setRequestHeader("x-archive-meta-title", safe(title));
    xhr.setRequestHeader(
      "x-archive-meta-creator",
      safe(artist || "Shadani Darbar")
    );
    xhr.setRequestHeader(
      "x-archive-meta-subject",
      safe(`Sindhi;Bhajan;${category};Shadani Darbar`)
    );
    xhr.setRequestHeader("x-archive-meta-language", safe(language));
    xhr.setRequestHeader("x-archive-meta-mediatype", "audio");

    // ⚠️ replaced "—" with "-" and encoded
    xhr.setRequestHeader(
      "x-archive-meta-description",
      safe(`${title} - ${category} from Shadani Darbar`)
    );

    xhr.setRequestHeader("x-archive-auto-make-bucket", "1");

    // 🚀 SEND
    xhr.send(file);
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

function ProgressBar({ percent }) {
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "0.68rem", color: "var(--text-soft)", fontFamily: "'Cinzel',serif", letterSpacing: "1px" }}>UPLOADING TO ARCHIVE.ORG</span>
        <span style={{ fontSize: "0.72rem", color: "var(--saffron)", fontWeight: 700 }}>{percent}%</span>
      </div>
      <div style={{ height: "6px", background: "var(--cream-dark)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percent}%`, background: "linear-gradient(90deg, var(--saffron), #f07840)", borderRadius: "4px", transition: "width 0.3s ease" }} />
      </div>
      <p style={{ fontSize: "0.68rem", color: "var(--text-soft)", marginTop: "6px" }}>
        {percent < 100 ? "Please don't close this window…" : "✦ Upload complete! Processing on Archive.org…"}
      </p>
    </div>
  );
}

function BhajanRow({ bhajan, index, onEdit, onDelete, onToggle, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", flexShrink: 0 }}>
        {[{ a: "▲", d: isFirst, f: () => onMoveUp(index) }, { a: "▼", d: isLast, f: () => onMoveDown(index) }].map(({ a, d, f }) => (
          <button key={a} onClick={f} disabled={d} style={{
            width: "24px", height: "24px", border: "1px solid var(--border)",
            borderRadius: "4px", background: d ? "var(--cream)" : "white",
            color: d ? "var(--cream-dark)" : "var(--text-soft)",
            cursor: d ? "default" : "pointer", fontSize: "0.65rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{a}</button>
        ))}
      </div>

      <div style={{
        flex: 1, display: "flex", alignItems: "center", gap: "14px",
        padding: "12px 16px", background: "#fff", borderRadius: "10px",
        border: "1px solid var(--border)", opacity: bhajan.show === false ? 0.5 : 1, transition: "box-shadow 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(180,120,0,0.1)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
      >
        <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: bhajan.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
          {bhajan.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.82rem", color: "var(--text-dark)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {bhajan.title || <span style={{ color: "var(--text-soft)" }}>Untitled</span>}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-soft)", marginTop: "3px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span>🎙 {bhajan.artist || "—"}</span>
            <span>⏱ {bhajan.duration || "—"}</span>
            <span style={{ background: "var(--cream)", border: "1px solid var(--cream-dark)", borderRadius: "10px", padding: "1px 7px", fontSize: "0.6rem" }}>{bhajan.category}</span>
            {bhajan.archiveId
              ? <span style={{ background: "rgba(46,107,31,0.08)", color: "#2e6b1f", border: "1px solid rgba(46,107,31,0.2)", borderRadius: "10px", padding: "1px 7px", fontSize: "0.6rem" }}>✓ archive.org</span>
              : bhajan.url
                ? <span style={{ background: "rgba(212,87,10,0.08)", color: "var(--saffron)", border: "1px solid rgba(212,87,10,0.2)", borderRadius: "10px", padding: "1px 7px", fontSize: "0.6rem" }}>{bhajan.type}</span>
                : <span style={{ background: "rgba(200,50,50,0.07)", color: "#c83232", border: "1px solid rgba(200,50,50,0.2)", borderRadius: "10px", padding: "1px 7px", fontSize: "0.6rem" }}>No URL</span>
            }
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button className="toggle-btn" onClick={() => onToggle(index)} style={{ background: bhajan.show !== false ? "linear-gradient(135deg,#d4570a,#a83800)" : "#bba98a" }}>
            <div className="toggle-thumb" style={{ left: bhajan.show !== false ? "28px" : "4px" }} />
          </button>
          <button onClick={() => onEdit(index)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-soft)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Lato',sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--saffron)"; e.currentTarget.style.color = "var(--saffron)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-soft)"; }}>Edit</button>
          <button onClick={() => onDelete(index)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(200,50,50,0.25)", background: "transparent", color: "#c83232", fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Lato',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(200,50,50,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function BhajanModal({ initial, onSave, onCancel }) {
  const [b, setB]                           = useState({ ...BLANK_BHAJAN, ...initial });
  const [file, setFile]                     = useState(null);
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError]       = useState(null);
  const [audioPreview, setAudioPreview]     = useState(initial?.url || "");
  const fileRef = useRef();
  const set = (k, v) => setB(prev => ({ ...prev, [k]: v }));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setUploadError(null);
    const objectUrl = URL.createObjectURL(f);
    setAudioPreview(objectUrl);
    const audio = new Audio(objectUrl);
    audio.addEventListener("loadedmetadata", () => {
      const m = Math.floor(audio.duration / 60);
      const s = Math.floor(audio.duration % 60).toString().padStart(2, "0");
      set("duration", `${m}:${s}`);
    });
  };

  const handleSubmit = async () => {
    if (file) {
      if (!b.title.trim()) { setUploadError("Please enter a title before uploading."); return; }
      setUploading(true); setUploadError(null); setUploadProgress(0);
      try {
        const { url, archiveId } = await uploadToArchive({
          file, title: b.title, artist: b.artist,
          category: b.category, language: b.language, onProgress: setUploadProgress,
        });
        setUploading(false);
        onSave({ ...b, url, archiveId, type: "MP3" });
      } catch (err) {
        setUploadError("✕ " + err.message);
        setUploading(false);
      }
    } else {
      onSave(b);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "600px", maxHeight: "92vh", overflow: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.2)", borderTop: "4px solid var(--saffron)" }}>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", color: "var(--text-dark)", margin: "0 0 24px", letterSpacing: "1px" }}>
          {initial?.title ? "✏️ Edit Bhajan" : "➕ Add New Bhajan"}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Title *" span><input value={b.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Jhulelal Aarti" /></Field>
          <Field label="Artist / Performed By"><input value={b.artist} onChange={e => set("artist", e.target.value)} placeholder="e.g. Pandit Ramesh Ji" /></Field>
          <Field label="Duration"><input value={b.duration} onChange={e => set("duration", e.target.value)} placeholder="Auto-filled on upload" /></Field>
          <Field label="Category"><select value={b.category} onChange={e => set("category", e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Language"><select value={b.language} onChange={e => set("language", e.target.value)}>{LANGUAGES.map(l => <option key={l}>{l}</option>)}</select></Field>
          <Field label="Source Type"><select value={b.type} onChange={e => set("type", e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Emoji Icon"><input value={b.emoji} onChange={e => set("emoji", e.target.value)} placeholder="🎶" style={{ fontSize: "1.2rem" }} /></Field>
          <Field label="Card Colour">
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", paddingTop: "4px" }}>
              {BG_PRESETS.map((bg, i) => (
                <button key={i} onClick={() => set("bg", bg)} style={{ width: "30px", height: "30px", borderRadius: "6px", background: bg, border: "2px solid transparent", cursor: "pointer", outline: b.bg === bg ? "2px solid var(--saffron)" : "none", outlineOffset: "2px" }} />
              ))}
            </div>
          </Field>
        </div>

        <div style={{ marginTop: "20px", padding: "18px", background: "var(--cream)", borderRadius: "12px", border: "1.5px dashed var(--border)" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--saffron)", fontWeight: 700, marginBottom: "12px", fontFamily: "'Cinzel',serif" }}>Audio File</div>

          {b.archiveId && !file && (
            <div style={{ padding: "10px 14px", background: "rgba(46,107,31,0.06)", border: "1px solid rgba(46,107,31,0.2)", borderRadius: "8px", marginBottom: "12px", fontSize: "0.72rem", color: "#2e6b1f" }}>
              <div style={{ fontWeight: 700, marginBottom: "2px" }}>✓ Already on Archive.org</div>
              <div style={{ opacity: 0.75, fontSize: "0.65rem", wordBreak: "break-all" }}>{b.url}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
            <input ref={fileRef} type="file" accept="audio/*" onChange={handleFileChange} style={{ display: "none" }} />
            <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ padding: "9px 18px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "white", color: "var(--text-mid)", fontSize: "0.78rem", cursor: uploading ? "not-allowed" : "pointer", fontFamily: "'Lato',sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              📁 {file ? "Change File" : "Choose MP3"}
            </button>
            {file && (
              <div style={{ fontSize: "0.72rem", color: "var(--text-soft)", minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "260px" }}>{file.name}</div>
                <div>{(file.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            )}
          </div>

          <div style={{ fontSize: "0.62rem", color: "var(--text-soft)", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>— or paste a URL manually —</div>
          <input value={b.url} onChange={e => { set("url", e.target.value); setAudioPreview(e.target.value); }} placeholder="https://archive.org/download/... or any direct audio URL" disabled={uploading} />

          {uploading && <ProgressBar percent={uploadProgress} />}
          {uploadError && <div className="feedback-error" style={{ marginTop: "10px" }}>{uploadError}</div>}

          {audioPreview && !uploading && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "0.62rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-soft)", marginBottom: "6px" }}>Preview</div>
              <audio controls src={audioPreview} style={{ width: "100%", height: "36px" }} />
            </div>
          )}
        </div>

        <div style={{ marginTop: "14px", padding: "14px 16px", background: "var(--cream)", borderRadius: "10px", border: "1px solid var(--cream-dark)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: b.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{b.emoji}</div>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.8rem", color: "var(--text-dark)", fontWeight: 600 }}>{b.title || "Bhajan Title"}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-soft)", marginTop: "2px" }}>🎙 {b.artist || "Artist"} &nbsp;·&nbsp; ⏱ {b.duration || "0:00"} &nbsp;·&nbsp; {b.category} &nbsp;·&nbsp; {b.language}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button onClick={onCancel} disabled={uploading} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-soft)", fontSize: "0.82rem", cursor: uploading ? "not-allowed" : "pointer", fontFamily: "'Lato',sans-serif" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={uploading} className="save-btn" style={{ flex: 2, padding: "11px" }}>
            {uploading ? `Uploading… ${uploadProgress}%` : file ? "⬆ Upload to Archive.org & Save" : "Save Bhajan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BhajanAdmin() {
  const [bhajans, setBhajans]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [editing, setEditing]   = useState(null);

  useEffect(() => {
    fetchConfig()
      .then(cfg => { setBhajans(cfg.bhajans || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const showFeedback = (ok, msg) => { setFeedback({ ok, msg }); setTimeout(() => setFeedback(null), 4000); };

  const handleSave = async (list = bhajans) => {
    setSaving(true);
    try { await saveConfig({ bhajans: list }); showFeedback(true, "✦ Bhajans saved successfully!"); }
    catch (e) { showFeedback(false, "✕ " + e.message); }
    setSaving(false);
  };

  const addOrUpdate = (b) => {
    const updated = editing === "new"
      ? [...bhajans, { ...b, id: Date.now().toString() }]
      : bhajans.map((item, i) => (i === editing ? { ...b } : item));
    setBhajans(updated);
    setEditing(null);
    handleSave(updated);
  };

  const deleteBhajan = (index) => {
    if (!window.confirm("Delete this bhajan? The file on Archive.org will remain.")) return;
    setBhajans(prev => prev.filter((_, i) => i !== index));
  };

  const toggleShow = (index) =>
    setBhajans(prev => prev.map((b, i) => i === index ? { ...b, show: b.show === false ? true : false } : b));

  const move = (index, dir) =>
    setBhajans(prev => {
      const next = [...prev];
      [next[index], next[index + dir]] = [next[index + dir], next[index]];
      return next;
    });

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: "var(--text-soft)", fontFamily: "'Cinzel',serif", fontSize: "0.8rem", letterSpacing: "2px" }}>Loading...</div>
  );

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", gap: "16px" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--saffron)", marginBottom: "4px" }}>Bhajan Corner</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-soft)" }}>{bhajans.length} bhajan{bhajans.length !== 1 ? "s" : ""} &nbsp;·&nbsp; Audio hosted on Archive.org</div>
        </div>
        <button className="save-btn" onClick={() => setEditing("new")} style={{ padding: "9px 20px", fontSize: "0.8rem", flexShrink: 0 }}>+ Add Bhajan</button>
      </div>

      <div style={{ padding: "12px 16px", marginBottom: "20px", background: "rgba(46,107,31,0.06)", border: "1px solid rgba(46,107,31,0.18)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "1.1rem" }}>🗄️</span>
        <div style={{ fontSize: "0.75rem", color: "#2e6b1f", lineHeight: 1.6 }}>
          <strong>Audio uploads directly to Archive.org</strong> — stored permanently under <code style={{ background: "rgba(46,107,31,0.1)", padding: "1px 5px", borderRadius: "4px" }}>shadani-darbar-*</code> identifiers. Free forever, no bandwidth limits.
        </div>
      </div>

      {bhajans.length === 0 && (
        <div style={{ textAlign: "center", padding: "52px 24px", background: "white", borderRadius: "14px", border: "2px dashed var(--cream-dark)", marginBottom: "20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎶</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>No bhajans yet. Click <strong>+ Add Bhajan</strong> to upload your first one.</div>
        </div>
      )}

      {bhajans.map((b, i) => (
        <BhajanRow key={b.id || i} bhajan={b} index={i}
          isFirst={i === 0} isLast={i === bhajans.length - 1}
          onEdit={setEditing} onDelete={deleteBhajan} onToggle={toggleShow}
          onMoveUp={(idx) => move(idx, -1)} onMoveDown={(idx) => move(idx, 1)}
        />
      ))}

      {feedback && (
        <div className={feedback.ok ? "feedback-success" : "feedback-error"} style={{ marginTop: "12px" }}>{feedback.msg}</div>
      )}

      {bhajans.length > 0 && (
        <button className="save-btn" onClick={() => handleSave()} disabled={saving} style={{ marginTop: "12px" }}>
          {saving ? "Saving…" : "Save All Changes"}
        </button>
      )}

      {editing !== null && (
        <BhajanModal
          initial={editing === "new" ? BLANK_BHAJAN : bhajans[editing]}
          onSave={addOrUpdate}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
