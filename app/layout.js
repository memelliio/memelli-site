import "./globals.css";

export const metadata = {
  title: "Memelli",
  description: "Memelli — credit, funding, and coaching on the rail."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="wm">MEME<b>LLI</b></div>
        {children}
      </body>
    </html>
  );
}
