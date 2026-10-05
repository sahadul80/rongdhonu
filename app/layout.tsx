import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import FloatingSupport from "./components/FloatingSupport";
import { LanguageProvider } from "./components/LanguageContext";

const SITE_URL = "https://www.rongdhonubd.com";
const SITE_NAME = "Rong Dhonu";
const BRAND_NAME = "Rong Dhonu";

const SOCIAL_IMAGE = `${SITE_URL}/images/rong-dhonu/social-card.jpg`;
const LOGO_IMAGE = `${SITE_URL}/images/rong-dhonu/icon-512.png`;

// Proper Bangla glyph support while retaining a clean Latin fallback.
const bengaliFont = Noto_Sans_Bengali({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "Rong Dhonu | Home Painting & Renovation Services in Bangladesh",
    template: "%s | Rong Dhonu",
  },

  description:
    "Rong Dhonu provides home painting, house painting, wall painting, color consultation, skim coat, texture work and decorative finishing solutions across Bangladesh.",

  applicationName: SITE_NAME,

  authors: [
    {
      name: SITE_NAME,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  category: "Home Improvement",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_BD",
    alternateLocale: ["bn_BD"],
    url: SITE_URL,
    siteName: SITE_NAME,

    title:
      "Rong Dhonu | Home Painting & Renovation Services in Bangladesh",

    description:
      "Professional home painting, house painting, wall finishes, color consultation, skim coat, texture work and decorative finishing solutions across Bangladesh.",

    images: [
      {
        url: SOCIAL_IMAGE,
        width: 1200,
        height: 1200,
        alt:
          "Rong Dhonu - Home Painting and Renovation Services in Bangladesh",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Rong Dhonu | Home Painting & Renovation Services in Bangladesh",

    description:
      "Home painting, wall painting, color consultation, skim coat, texture and decorative finishing solutions in Bangladesh.",

    images: [SOCIAL_IMAGE],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/images/rong-dhonu/icon-512.png",
    apple: "/images/rong-dhonu/icon-512.png",
  },

  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",

  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#1a5482",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#0a2338",
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",

  "@id": `${SITE_URL}/#organization`,

  name: SITE_NAME,
  alternateName: BRAND_NAME,
  url: SITE_URL,
  logo: LOGO_IMAGE,

  description:
    "Rong Dhonu provides home painting, wall painting, renovation and decorative finishing solutions across Bangladesh.",

  areaServed: {
    "@type": "Country",
    name: "Bangladesh",
  },

  knowsAbout: [
    "Home painting",
    "House painting",
    "Wall painting",
    "Interior painting",
    "Exterior painting",
    "Color consultation",
    "Wall color design",
    "Skim coat",
    "Texture work",
    "Decorative painting",
    "Marble painting",
    "Ambrose painting",
    "Surface preparation",
    "Home renovation",
    "Interior renovation",
    "Painting solutions",
  ],

  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",

  "@id": `${SITE_URL}/#website`,

  url: SITE_URL,
  name: SITE_NAME,
  alternateName: BRAND_NAME,

  description:
    "Home painting, renovation and decorative finishing solutions in Bangladesh.",

  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },

  inLanguage: ["en-BD", "bn-BD"],
};

const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",

  "@id": `${SITE_URL}/#service`,

  name: SITE_NAME,
  url: SITE_URL,

  description:
    "Professional home painting, wall painting, color consultation, skim coat, texture work, decorative painting and renovation finishing services across Bangladesh.",

  image: SOCIAL_IMAGE,

  provider: {
    "@id": `${SITE_URL}/#organization`,
  },

  areaServed: {
    "@type": "Country",
    name: "Bangladesh",
  },

  serviceType: [
    "Home Painting",
    "House Painting",
    "Wall Painting",
    "Interior Painting",
    "Exterior Painting",
    "Color Consultation",
    "Wall Color Design",
    "Skim Coat Work",
    "Texture Work",
    "Decorative Painting",
    "Marble Painting",
    "Ambrose Painting",
    "Surface Preparation",
    "Home Renovation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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

        {/* Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        {/* Services */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              professionalServiceSchema,
            ),
          }}
        />
      </head>

      <body className={bengaliFont.variable}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <FloatingSupport />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}