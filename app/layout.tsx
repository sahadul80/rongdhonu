import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import FloatingSupport from "./components/FloatingSupport";

export const metadata: Metadata = {
  title: "Rong Dhonu Renovation Limited",
  description:
    "Rong Dhonu Renovation Limited — Color | Design | Transform. Painting, wall color, skim coat and decorative finishing services in Bangladesh.",
  keywords: [
    "Rong Dhonu Renovation",
    "Rong Dhonu Renovation Limited",
    "renovation Bangladesh",
    "interior design Bangladesh",
    "painting services Dhaka",
    "home renovation",
    "commercial renovation",
    "general painting work",
    "wall paint color schemes",
    "skim coat work",
    "marble painting",
    "ambrose painting",
    "texture work",
  ],
  authors: [{ name: "Rong Dhonu Renovation Limited" }],
  creator: "Rong Dhonu Renovation Limited",
  publisher: "Rong Dhonu Renovation Limited",
  metadataBase: new URL("https://www.rongdhonurenovation.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://www.rongdhonurenovation.com",
    siteName: "Rong Dhonu Renovation Limited",
    title: "Rong Dhonu Renovation Limited",
    description: "COLOR | DESIGN | TRANSFORM",
    images: [{ url: "/images/rong-dhonu/logo.jpg", width: 1200, height: 1200, alt: "Rong Dhonu Renovation Limited" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rong Dhonu Renovation Limited",
    description: "COLOR | DESIGN | TRANSFORM",
    images: ["/images/rong-dhonu/logo.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/images/rong-dhonu/logo.jpg", apple: "/images/rong-dhonu/logo.jpg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}<FloatingSupport /></ThemeProvider>
      </body>
    </html>
  );
}
