"use client";

import NewsletterSection from "./NewsletterSection";
import TeamSection from "./TeamSection";
import type { BusinessPublicSummary } from "@/app/types/public-cms";

export default function ContactTeamSection({ business }: { business: BusinessPublicSummary | null }) {
  const hasTeam = Boolean(business?.hasTeam);

  return (
    <section className="bg-background px-3 py-6 sm:px-4 sm:py-8 lg:py-9">
      <div className={`contact-team-layout mx-auto grid w-full max-w-7xl min-w-0 gap-5 sm:gap-6 lg:gap-7 ${hasTeam ? "lg:grid-cols-[0.9fr_1.1fr]" : "lg:grid-cols-1"}`}>
        {hasTeam ? (
          <div className="contact-team-panel min-w-0">
            <TeamSection embedded teamSlug={business?.teamSlug || "our-team"} />
          </div>
        ) : null}

        <div className={`contact-team-panel min-w-0 ${hasTeam ? "" : "mx-auto w-full max-w-3xl"}`}>
          <NewsletterSection embedded={hasTeam} />
        </div>
      </div>
    </section>
  );
}
