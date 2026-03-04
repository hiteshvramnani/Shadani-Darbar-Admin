export default function Toggle({ value, onChange }) {
  return (
    <button
      className="toggle-btn"
      onClick={() => onChange(!value)}
      style={{
        background: value
          ? "linear-gradient(135deg, #d4570a, #a83800)"
          : "#bba98a",
      }}
    >
      <div className="toggle-thumb" style={{ left: value ? "28px" : "4px" }} />
    </button>
  );
}
