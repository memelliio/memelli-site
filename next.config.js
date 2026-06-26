/** @type {import('next').NextConfig} */
// universal-shell local: serve the REAL bar-control home shell (public/home.html)
// and proxy live DATA calls to the rail. ALL static assets (modules, css, icon,
// manifest) are served LOCAL so the home renders sub-second with zero blocking
// rail round-trips; only live data (/api/live_data, /api/video, _CUSTCTX, etc.)
// hits the rail, asynchronously after first paint.
const RAIL = "https://memelli-bar-control.up.railway.app";
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: { NEXT_PUBLIC_RAIL: RAIL },
  // The INDEX (app.html, served at / and /app) must NEVER be cached, or browsers
  // heuristically reuse a stale app.html with old &v= values and never refetch the
  // changed mods -> that is the entire "you have to hard-refresh" bug. The mods
  // themselves stay cacheable (they're versioned by &v=). HTTP header only; the
  // <meta> equivalent is ignored by modern browsers.
  async headers() {
    const noStore = [{ key: "Cache-Control", value: "no-store, must-revalidate" }];
    return [
      { source: "/", headers: noStore },
      { source: "/app", headers: noStore },
      { source: "/app.html", headers: noStore },
      // the version heartbeat must never cache either
      { source: "/api/version", headers: noStore },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // root => THE PROCESS (render + bar + credit-repair dashboard). The site IS just this process.
        { source: "/", destination: "/app.html" },
        // /app => same process (kept as an explicit alias)
        { source: "/app", destination: "/app.html" },
        // ALL modules + the stylesheet served LOCAL (no rail round-trip, no render block)
        { source: "/api/home/mod", has: [{ type: "query", key: "f", value: "(?<file>[a-z0-9_]+\\.(?:js|css))" }], destination: "/mod/:file" },
        // app icon + manifest served LOCAL static (were ~4.5s each from the rail)
        { source: "/api/app_icon", destination: "/app_icon_180.png" },
        { source: "/api/app_manifest", destination: "/app_manifest.json" },
        // version heartbeat: tiny local file the open-tab poller compares to window.__BUILD
        { source: "/api/version", destination: "/version.json" },
      ],
      afterFiles: [
        // everything else (live data/media) goes to the live rail
        { source: "/api/:path*", destination: RAIL + "/api/:path*" },
      ],
    };
  },
};
module.exports = nextConfig;
