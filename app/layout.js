// [bar_mel 2026-06-20] minimal root layout. The live page is the universal shell served
// from public/home.html via next.config rewrites + /api proxy to the rail. No old React
// home/components/theme — those were the superseded design and have been deleted.
export const metadata = { title: "Memelli", description: "Memelli — credit, funding, and coaching." };
export default function RootLayout({ children }) {
  return (
    <html lang="en"><body style={{ margin: 0, background: "#000" }}>{children}</body></html>
  );
}
