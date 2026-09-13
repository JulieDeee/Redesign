import "./globals.css";
import { BRAND, TAGLINE } from "@/lib/brand";

export const metadata = {
  title: `${BRAND} — ${TAGLINE.toLowerCase()}`,
  description: "Upload a photo of your room, choose a style, and see your actual space redesigned in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&family=Archivo:wght@400;500;600&family=Sacramento&family=Caveat:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
