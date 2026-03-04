import { useState } from "react";
import { saveConfig } from "../../lib/api";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Feedback from "../../components/Feedback";

const DEFAULT = {
  heading:   "A Sacred Abode of Jhule Lal",
  para1:     "Shadani Darbar in Raipur is one of the most revered Sindhi religious institutions in Central India. Established in 1972, it has been a spiritual home for thousands of devotees of Ishtdev Jhule Lal — the beloved deity of the Sindhi community.",
  para2:     "The Darbar holds daily aarti, weekly bhajan sandhyas, and grand celebrations for Cheti Chand, Diwali, and other festivals. It also runs community service programmes including a langar that serves prasad to all who visit.",
  para3:     "Over the decades, Shadani Darbar has grown from a humble prayer room to a full-fledged religious and cultural centre, uniting the Sindhi diaspora across Raipur and beyond.",
  stat1_num: "50+",  stat1_lbl: "Years of Service",
  stat2_num: "10K+", stat2_lbl: "Devotees",
  stat3_num: "365",  stat3_lbl: "Days Open",
};

function Field({ label, value, onChange, rows }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {rows
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} />
        : <input value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

export default function AboutContentAdmin() {
  const [data,     setData]     = useState(DEFAULT);
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState(null);

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const save = async () => {
    setSaving(true); setFeedback(null);
    try {
      await saveConfig({ aboutContent: data });
      setFeedback({ ok: true, msg: "✦ About content updated!" });
    } catch (e) {
      setFeedback({ ok: false, msg: "✕ " + e.message });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <Card>
        <CardHeader title="About Page Text" subtitle="Edit the text shown on the about page" />
        <CardBody>
          <Field label="Heading"     value={data.heading} onChange={v => set("heading", v)} />
          <Field label="Paragraph 1" value={data.para1}   onChange={v => set("para1", v)}   rows={3} />
          <Field label="Paragraph 2" value={data.para2}   onChange={v => set("para2", v)}   rows={3} />
          <Field label="Paragraph 3" value={data.para3}   onChange={v => set("para3", v)}   rows={3} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", margin: "4px 0 8px" }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ background: "var(--cream)", borderRadius: "10px", padding: "14px", border: "1px solid var(--border)" }}>
                <label className="field-label">Stat {n} Number</label>
                <input value={data[`stat${n}_num`]} onChange={e => set(`stat${n}_num`, e.target.value)} style={{ marginBottom: "8px" }} />
                <label className="field-label">Stat {n} Label</label>
                <input value={data[`stat${n}_lbl`]} onChange={e => set(`stat${n}_lbl`, e.target.value)} />
              </div>
            ))}
          </div>

          <Feedback feedback={feedback} />
          <div style={{ marginTop: "20px" }}>
            <button className="save-btn" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
