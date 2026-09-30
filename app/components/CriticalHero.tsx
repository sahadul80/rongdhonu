import { getBusinessPublicSummary, getPrimaryHeroImage } from "@/lib/content";
import Navbar from "./Navbar";
import Hero from "./Hero";
import RongDhonuRenovationPageContent from "./RongDhonuRenovationPageContent";

/**
 * The first viewport deliberately performs only two small reads: business summary and
 * one primary hero image. Lower CMS collections are loaded by their own sections later.
 */
export default async function CriticalHero() {
  const [business, initialHero] = await Promise.all([
    getBusinessPublicSummary(),
    getPrimaryHeroImage(),
  ]);

  return (
    <>
      <Navbar business={business} />
      <Hero business={business} initialHero={initialHero} />
      <RongDhonuRenovationPageContent business={business} />
    </>
  );
}
