export default function Shell({ step, total, label, title, sub, children }) {
  const bars = [];
  for (let i = 0; i < (total || 0); i++) {
    bars.push(<i key={i} className={i < step ? "on" : ""} />);
  }
  return (
    <>
      <a className="back" href="/account">Dashboard</a>
      <div className="wrap">
        <div className="card">
          {total ? <div className="prog">{bars}</div> : null}
          {label ? <div className="step">{label}</div> : null}
          <h1>{title}</h1>
          {sub ? <div className="sub">{sub}</div> : null}
          {children}
        </div>
      </div>
    </>
  );
}
