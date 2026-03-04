export function Card({ children, style }) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="card-header">
      <div>
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: "0.85rem",
            color: "var(--text-dark)",
            fontWeight: 600,
            marginBottom: subtitle ? "2px" : 0,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: "0.72rem", color: "var(--text-soft)" }}>
            {subtitle}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}
