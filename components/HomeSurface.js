'use client';
// HomeSurface — landing copy over the wall. Hot-swaps in place (no route nav).
// onStart() flips the shell surface to 'signup'. Stamp: universal-shell v1.
export default function HomeSurface({ onStart }) {
  return (
    <section
      style={{
        position: 'relative', zIndex: 5, minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 6vw', pointerEvents: 'none',
      }}
    >
      <div style={{ color: '#e11d2a', letterSpacing: 6, fontWeight: 700, fontSize: 14 }}>MEMELLI</div>
      <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4.5rem)', margin: '12px 0 18px', lineHeight: 1.05, color: '#f2f2f2' }}>
        Your credit, funding &amp; coaching —<br />one structured journey.
      </h1>
      <p style={{ maxWidth: 620, color: '#bdbdbd', fontSize: 18, margin: 0 }}>
        Ask Mellie anything below, or start your account.
      </p>
      <button
        onClick={onStart}
        style={{
          pointerEvents: 'auto', marginTop: 30, padding: '14px 32px', borderRadius: 10,
          background: '#e11d2a', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer',
        }}
      >
        Start — Sign up
      </button>
    </section>
  );
}
