export const BRAND = {
  name: "Rong Dhonu",
  nameBn: "রংধনু",
  shortName: "Rong Dhonu",
  tagline: "COLOR | DESIGN | TRANSFORM",
  taglineBn: "রং | ডিজাইন | রূপান্তর",
  phone: "+880 1886 030025",
  email: "info@rongdhonu.com",
  website: "www.rongdhonu.com",
  address: "256/2, West Agargaon, Agargaon, Dhaka 1207, Bangladesh",
  addressBn: "২৫৬/২, পশ্চিম আগারগাঁও, আগারগাঁও, ঢাকা ১২০৭, বাংলাদেশ",
  mapQuery: "Rong Dhonu Renovation Limited, 256/2, West Agargaon, Agargaon, Dhaka 1207, Bangladesh",
  assets: {
    logo: "/images/rong-dhonu/logo-light.png",
    logoReversed: "/images/rong-dhonu/logo-reversed.png",
    banner: "/images/rong-dhonu/banner.jpg",
    socialCard: "/images/rong-dhonu/social-card.jpg",
    icon: "/images/rong-dhonu/icon-512.png",
    collateral: "/images/rong-dhonu/brand-collateral.jpg",
    tshirt: "/images/rong-dhonu/tshirt.jpg",
  },
} as const;

/** Shows the Bangla tagline when the visitor is in Bangla and the tagline is still the
 *  built-in one; a custom tagline typed in the admin is shown exactly as entered. */
export function localizedTagline(tagline: string | null | undefined, language: "en" | "bn"): string {
  const value = (tagline || BRAND.tagline).trim();
  if (language === "bn" && value.toUpperCase() === BRAND.tagline) return BRAND.taglineBn;
  return value;
}
