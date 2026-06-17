import FieldWall from "../components/FieldWall";
import MellieDock from "../components/MellieDock";

export default function Home() {
  return (
    <>
      <FieldWall />
      <main className="screen">
        <svg className="crown" viewBox="0 0 64 42" aria-hidden="true">
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe89a" />
              <stop offset="1" stopColor="#e11d2a" />
            </linearGradient>
          </defs>
          <path d="M3 36 L3 16 L18 27 L32 4 L46 27 L61 16 L61 36 Z" fill="url(#cg)" />
          <rect x="3" y="36" width="58" height="5" rx="2" fill="url(#cg)" />
        </svg>
        <h1 className="wordmark">MEMELLI</h1>
        <p className="tagline">Credit, funding, and coaching — on one rail.</p>
        <div className="cta-row">
          <a className="hbtn" href="/signup">Get started</a>
          <a className="ghost" href="/signin">Sign in</a>
        </div>
      </main>
      <MellieDock />
    </>
  );
}
