import type { Metadata, Viewport } from "next";
import { Newsreader, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

// One serif and one mono for the whole product, the public site and the app alike.
// Newsreader carries an optical size axis, so one family holds a 90px headline and a
// 15px table cell. Geist Mono is the instrument voice: levels, readouts, labels, the
// demo. Both are OFL, which matters because this repository is public.
//
// The app's stylesheet still speaks of `--font-satoshi` and `--font-iosevka`; those
// names are aliased to these two in `globals.css` rather than renamed everywhere.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

// Geist (also OFL) is the conversation's face and nothing else's: answers, the patient's
// messages and the box they type in, through `.chat-sans` in `globals.css`. The owner asked
// for a sans there on 2026-11-15; headings, labels and every other page keep the two above.
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-chat-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-site-mono",
  display: "swap",
});

/* `SITE_URL` is the address the site is served from, so the link-preview image gets a full
   address. Set it wherever the site is deployed; without it the preview points at localhost. */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  openGraph: { siteName: "MedTriage", type: "website" },
  twitter: { card: "summary_large_image" },
  title: "MedTriage — clinical triage with graduated autonomy",
  description:
    "A triage system that gives up its own autonomy as your risk rises. Low-risk answers come straight back; anything clinical is verified by a physician; emergencies lock the AI out entirely.",
};

// The browser's own bar takes the night ink, as the public site and the logo do.
export const viewport: Viewport = { themeColor: "#0b0d0c" };

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
      <body className={`${newsreader.variable} ${sans.variable} ${mono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
