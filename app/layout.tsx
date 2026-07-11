import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

// Archivo: a grotesque with tight apertures — the voice of hospital wayfinding.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Plex Mono carries every clinical number: levels, confidences, timestamps, ids.
// It should read like a lab printout, because that is what it is.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MedTriage — clinical triage with graduated autonomy",
  description:
    "A triage system that gives up its own autonomy as your risk rises. Low-risk answers come straight back; anything clinical is verified by a physician; emergencies lock the AI out entirely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('medtriage-theme');document.documentElement.classList.add(t||'light')}catch(e){document.documentElement.classList.add('light')}})()`,
          }}
        />
      </head>
      <body className={`${archivo.variable} ${plexMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
