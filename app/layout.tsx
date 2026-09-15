import Maintenance from "@/components/layout/Maintenance";
import LenisProvider from "@/components/providers/LenisProvider";
import { getSiteConfig } from "@/lib/integrations/notion";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const siteUrl = "https://www.adithyakrishnan.com";
const siteName = "Adithya Krishnan";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Adithya Krishnan — Software Engineer",
    template: "%s | Adithya Krishnan",
  },

  description:
    "Adithya Krishnan is a Software Engineer and Open Source Developer from Kerala, India, specializing in frontend development, full-stack engineering, cloud technologies, and developer tools.",

  keywords: [
    "Adithya Krishnan",
    "Software Engineer",
    "Full Stack Engineer",
    "Frontend Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Java Spring Boot",
    "Three.js",
    "Kerala Software Engineer",
    "Open Source Developer",
    "fal3n-4ngel",
  ],

  authors: [
    {
      name: siteName,
      url: siteUrl,
    },
  ],

  creator: siteName,
  publisher: siteName,

  alternates: {
    canonical: siteUrl,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Adithya Krishnan — Software Engineer",
    description:
      "Official website of Adithya Krishnan, Software Engineer and Open Source Developer.",
    siteName,
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Adithya Krishnan — Software Engineer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Adithya Krishnan — Software Engineer",
    description:
      "Official website of Adithya Krishnan, Software Engineer and Open Source Developer.",
    creator: "@fal3n4ngel",
    site: "@fal3n4ngel",
    images: ["/logo.png"],
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/logo.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/logo.png",
      },
    ],
    shortcut: ["/logo.png"],
  },

  category: "technology",

  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#person`,

  name: "Adithya Krishnan",

  url: siteUrl,

  image: {
    "@type": "ImageObject",
    url: `${siteUrl}/logo.png`,
  },

  jobTitle: "Software Engineer",

  description:
    "Adithya Krishnan is a Software Engineer and Open Source Developer specializing in frontend development, full-stack engineering, cloud technologies, and developer tools.",

  worksFor: {
    "@type": "Organization",
    name: "Equifax",
  },

  sameAs: [
    "https://github.com/fal3n-4ngel",
    "https://www.linkedin.com/in/fal3n-4ngel/",
    "https://twitter.com/fal3n4ngel",
  ],

  knowsAbout: [
    "Software Engineering",
    "Frontend Development",
    "Full Stack Development",
    "React",
    "Next.js",
    "TypeScript",
    "Java",
    "Spring Boot",
    "Cloud Computing",
    "Open Source Software",
    "Developer Tools",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,

  name: siteName,

  url: siteUrl,

  description:
    "Official website and portfolio of Adithya Krishnan, Software Engineer and Open Source Developer.",

  publisher: {
    "@id": `${siteUrl}/#person`,
  },

  inLanguage: "en",
};

const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",

  "@id": `${siteUrl}/#profile`,

  url: siteUrl,

  name: "Adithya Krishnan — Software Engineer",

  description:
    "Official profile and portfolio of Adithya Krishnan, Software Engineer and Open Source Developer.",

  mainEntity: {
    "@id": `${siteUrl}/#person`,
  },

  isPartOf: {
    "@id": `${siteUrl}/#website`,
  },

  inLanguage: "en",
};

const structuredData = [
  personSchema,
  websiteSchema,
  profilePageSchema,
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

  const isMaintenanceMode =
    !config?.["system"]?.isEnabled ||
    config?.["maintenance mode"]?.isEnabled ||
    false;

  const isOffline =
    (config?.["status"] && !config?.["status"]?.isEnabled) ||
    (config?.["active status"] && !config?.["active status"]?.isEnabled);

  const showMaintenance = isMaintenanceMode || isOffline;

  const maintenanceText =
    config?.["maintenance"]?.content ||
    config?.["system"]?.content ||
    config?.["maintenance mode"]?.content ||
    config?.["status"]?.content ||
    config?.["active status"]?.content;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full min-h-screen w-full scroll-smooth bg-black`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          rel="dns-prefetch"
          href="https://www.googletagmanager.com"
        />

        <meta
          name="theme-color"
          content="#060606"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>

      <body className={`${inter.className} custom-scrollbar dark`}>
        {showMaintenance ? (
          <Maintenance content={maintenanceText} />
        ) : (
          <LenisProvider>
            <div className="relative z-[1]">
              {children}
            </div>
          </LenisProvider>
        )}

        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <GoogleAnalytics
          gaId={process.env.FIREBASE_MEASUREMENT_ID || ""}
        />

        <Analytics />

        <SpeedInsights />

        <Script
          id="canary-token"
          strategy="afterInteractive"
        >
          {`
            if (
              window.location.hostname !== "www.adithyakrishnan.com" &&
              !window.location.hostname.endsWith(".www.adithyakrishnan.com")
            ) {
              var p = !document.location.protocol.startsWith("http")
                ? "http:"
                : document.location.protocol;

              var l = location.href;
              var r = document.referrer;
              var m = new Image();

              m.src =
                p +
                "//canarytokens.com/about/tags/lscmifrnb2fnhwkgcre1y6ykt/contact.php?l=" +
                encodeURI(l) +
                "&r=" +
                encodeURI(r);
            }
          `}
        </Script>
      </body>
    </html>
  );
}

