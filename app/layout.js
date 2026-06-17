import "./globals.css";

export const metadata = {
  title: "Memelli",
  description: "Memelli — credit, funding, and coaching on the rail."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#000" }}>{children}</body>
    </html>
  );
}
