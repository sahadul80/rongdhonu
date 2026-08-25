import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";
import NewsletterSection from "./NewsletterSection";
import ProcessSection from "./ProcessSection";
import ServicesSection from "./ServicesSection";

export default function RongDhonuRenovationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ServicesSection />
        <ProcessSection />
        <AboutSection />
        <ContactSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
