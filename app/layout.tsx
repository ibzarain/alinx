import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "A-LINX Building Technologies",
  description:
    "A-Linx is a fully integrated builder of modular structures and panelized systems. The market-leading precision of our engineering and factory fabrication allow your project to advance with previously unthinkable speed, accuracy and economy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${dmSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <span data-hero-font-probe className="hero-pixel-font-probe" aria-hidden>
          A
        </span>
        {children}
      </body>
    </html>
  );
}
