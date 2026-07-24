import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

// Satoshi runs the whole page — headline and body both. A single grotesque with a
// tall x-height and open apertures holds a 96px display line and a 15px paragraph
// without either looking like a different brand, which is why the sites this is
// modelled on ship one family rather than a display/body pair.
//
// Self-hosted rather than pulled from Fontshare's CDN: one variable file covering
// 300-900, no render-blocking request to a third party, and dev works offline.
const satoshi = localFont({
  src: "../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

// Iosevka carries every clinical number: levels, confidences, timestamps, ids. It
// should read like a lab printout, because that is what it is — and Iosevka is the
// narrowest credible mono, half an em per character against Plex Mono's 0.6, which
// is what lets a dense card hold a whole log line without shrinking the type.
//
// Subset before shipping. Fontsource's "latin" cut is 984KB PER WEIGHT because
// Iosevka's Latin block carries thousands of glyphs this interface will never
// render; cut to the characters actually used it is ~15KB.
const iosevka = localFont({
  src: [
    { path: "../public/fonts/Iosevka-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Iosevka-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Iosevka-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-iosevka",
  display: "swap",
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
      <body className={`${satoshi.variable} ${iosevka.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
