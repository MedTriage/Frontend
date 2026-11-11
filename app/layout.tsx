import type { Metadata } from "next";
import { Newsreader, Geist_Mono } from "next/font/google";
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

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-site-mono",
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
      <body className={`${newsreader.variable} ${mono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
