"use client";

import NewsletterSection from "./NewsletterSection";
import TeamSection from "./TeamSection";
import type { BusinessPublicSummary } from "@/app/types/public-cms";

export default function ContactTeamSection({ business }: { business: BusinessPublicSummary | null }) {
  const hasTeam = Boolean(business?.hasTeam);
  return (
    <section className="bg-background px-4 py-7 sm:py-10">
      <div className={hasTeam ? "mx-auto grid max-w-7xl min-w-0 gap-6 lg:grid-cols-2 lg:gap-8" : "mx-auto max-w-3xl min-w-0"}>
        <NewsletterSection embedded={hasTeam} />
        {hasTeam ? <TeamSection embedded teamSlug={business?.teamSlug || "our-team"} /> : null}
      </div>
    </section>
  );
}
