"use client";

import { useState } from "react";
import AboutSection from "./AboutSection";
import AnimatedLogoLoader from "./AnimatedLogoLoader";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";
import NewsletterSection from "./NewsletterSection";
import ProcessSection from "./ProcessSection";
import ServicesSection from "./ServicesSection";

export default function RongDhonuRenovationPage() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <AnimatedLogoLoader onComplete={() => setLoading(false)} />}
      <div className="min-h-screen bg-black">
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
    </>
  );
}
