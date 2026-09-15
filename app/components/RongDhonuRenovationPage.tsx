import AboutSection from "./AboutSection";
import BannerSection from "./BannerSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";
import NewsletterSection from "./NewsletterSection";
import ReviewsSection from "./ReviewsSection";
import ProcessSection from "./ProcessSection";
import ServicesSection from "./ServicesSection";

export default function RongDhonuRenovationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* pt-[--nav-h] keeps every section clear of the fixed nav so the
          first title on the page is never cropped underneath it. */}
      <main className="pt-(--nav-h)">
        <Hero />
        <ServicesSection />
        <ProcessSection />
        <AboutSection />
        <ReviewsSection />
        <ContactSection />
        <NewsletterSection />
      </main>
      <BannerSection />
      <Footer />
    </div>
  );
}
