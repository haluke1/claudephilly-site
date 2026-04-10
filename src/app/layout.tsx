import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/lib/lenis-provider";
import GsapProvider from "@/lib/gsap-provider";
import CursorSpotlight from "@/components/shared/CursorSpotlight";
import ClickRipple from "@/components/shared/ClickRipple";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClaudePhilly — Build with AI, Not Just Talk About It",
  description:
    "Philadelphia's builder-first AI community. Stop watching tutorials. Start building with people who ship.",
  openGraph: {
    title: "ClaudePhilly — Build with AI, Not Just Talk About It",
    description:
      "Philadelphia's builder-first AI community. Stop watching tutorials. Start building with people who ship.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClaudePhilly — Build with AI, Not Just Talk About It",
    description:
      "Philadelphia's builder-first AI community. Stop watching tutorials. Start building with people who ship.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}
    >
      <body className="bg-bg-deep text-text font-body min-h-screen">
        <CursorSpotlight />
        <ClickRipple />
        <LenisProvider>
          <GsapProvider>{children}</GsapProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
