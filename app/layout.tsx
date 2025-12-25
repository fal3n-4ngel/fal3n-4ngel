import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, Poppins, Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";
import LenisProvider from "./utils/LenisProvider";

// Optimized font loading with display swap
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-work-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
  variable: "--font-poppins",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.adithyakrishnan.com"),
  title: {
    default: "Adithya Krishnan | Software Engineer & Full Stack Developer",
    template: "%s | Adithya Krishnan",
  },
  description:
    "Software Engineer crafting exceptional digital experiences. Specialized in full-stack development, cloud architecture, and modern web technologies. Former Engineer at Equifax, Nissan Digital, and UST Global.",
  keywords: [
    "Adithya Krishnan",
    "Software Engineer",
    "Full Stack Developer",
    "Web Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript Developer",
    "fal3n4ngel",
    "Equifax Engineer",
    "Nissan Digital",
    "Cloud Computing",
    "MERN Stack",
    "Frontend Developer",
    "Backend Developer",
    "Software Development Engineer",
    "Portfolio",
    "Kerala Developer",
    "India Software Engineer",
  ],
  authors: [{ name: "Adithya Krishnan", url: "https://www.adithyakrishnan.com" }],
  creator: "Adithya Krishnan",
  publisher: "Adithya Krishnan",
  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Adithya Krishnan | Software Engineer",
    description:
      "Software Engineer crafting exceptional digital experiences with modern web technologies.",
    url: "https://www.adithyakrishnan.com",
    siteName: "Adithya Krishnan Portfolio",
    images: [
      {
        url: "https://www.adithyakrishnan.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Adithya Krishnan - Software Engineer Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adithya Krishnan | Software Engineer",
    description: "Software Engineer crafting exceptional digital experiences",
    images: ["https://www.adithyakrishnan.com/logo.png"],
    creator: "@fal3n4ngel",
    site: "@fal3n4ngel",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
    shortcut: ["/logo.png"],
  },
  alternates: {
    canonical: "https://www.adithyakrishnan.com",
  },
  verification: {
    google: "your-google-verification-code", // Add your actual verification code
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${workSans.variable} ${poppins.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <meta name="theme-color" content="#060606" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} custom-scrollbar dark`}>
        <LenisProvider>{children}</LenisProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
