"use client";

import { Mail } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BRAND } from "@/app/data/brand";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsTeamMember } from "@/app/types/public-cms";
import ContentDetailModal from "./ContentDetailModal";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface TeamSectionProps {
  embedded?: boolean;
  teamSlug: string;
}

export default function TeamSection({ embedded = false, teamSlug }: TeamSectionProps) {
  const { t, language, pick } = useLanguage();
  const { ref, data, loading, error } = useLazyPublicData<{ team: CmsTeamMember[] }>("/api/public/team");
  const team = data?.team ?? [];
  const [selectedMember, setSelectedMember] = useState<CmsTeamMember | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const closeModal = useCallback(() => setSelectedMember(null), []);

  useEffect(() => {
    if (!selectedMember) return;
    if (!team.some((member) => member.id === selectedMember.id)) setSelectedMember(null);
  }, [selectedMember, team]);

  function move(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.min(320, rail.clientWidth * 0.82), behavior: "smooth" });
  }

  const sectionClass = embedded ? "team-section team-section--embedded" : "team-section bg-background";

  return (
    <section id={teamSlug} ref={ref} className={sectionClass} aria-labelledby="team-title">
      <div className="team-section__inner">
        <header className="team-section__header">
          <div className="eyebrow-row">
            <span className="eyebrow-line" aria-hidden="true" />
            <span className="eyebrow-text">{t("team")}</span>
          </div>
          <h2 id="team-title" className="team-section__title">{t("teamTitle")}</h2>
          <p className="team-section__intro">{t("teamIntro")}</p>
        </header>

        {loading || !data ? (
          <div className="team-grid-skeleton" aria-label="Loading team members">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="team-card-skeleton animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="team-state" role="alert">{error}</div>
        ) : team.length === 0 ? null : (
          <>
            <div ref={railRef} className="team-mobile-swipe-rail" aria-label={t("team")}>
              {team.map((member, index) => {
                const role = language === "bn" && member.roleBn ? member.roleBn : member.role;
                const bio = language === "bn" && member.bioBn ? member.bioBn : member.bio;
                const name = pick(member.name, member.nameBn);

                return (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="team-card group"
                    aria-label={`${t("viewProfile")}: ${name}`}
                  >
                    <div className="team-card__media">
                      {member.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- CMS image data can be a data URI.
                        <img
                          src={member.photoUrl}
                          alt={name}
                          loading={index === 0 ? "eager" : "lazy"}
                          className="team-card__image"
                        />
                      ) : (
                        <div className="team-card__placeholder" aria-hidden="true">
                          {initialsOf(name)}
                        </div>
                      )}
                      <div className="team-card__media-shade" aria-hidden="true" />
                    </div>

                    <div className="team-card__body">
                      <span className="team-card__role">{role}</span>
                      <h3 className="team-card__name">{name}</h3>
                      {bio ? <p className="team-card__bio">{bio}</p> : <span className="team-card__bio team-card__bio--empty" />}
                      <span className="team-card__footer">
                        <span>{t("viewProfile")}</span>
                        <span className="team-card__arrow" aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {team.length > 1 && (
              <div className="team-rail-controls">
                <button type="button" onClick={() => move(-1)} className="team-rail-button" aria-label="Previous team member">←</button>
                <span className="team-rail-hint">{t("viewProfile")}</span>
                <button type="button" onClick={() => move(1)} className="team-rail-button" aria-label="Next team member">→</button>
              </div>
            )}
          </>
        )}
      </div>

      <ContentDetailModal
        open={Boolean(selectedMember)}
        title={selectedMember ? pick(selectedMember.name, selectedMember.nameBn) : ""}
        onClose={closeModal}
        labelledById="team-member-modal-title"
      >
        {selectedMember && (
          <article className="team-modal-card">
            <div className="team-modal-card__media">
              {selectedMember.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS image data can be a data URI.
                <img
                  src={selectedMember.photoUrl}
                  alt={pick(selectedMember.name, selectedMember.nameBn)}
                  className="h-full min-h-72 w-full object-cover"
                />
              ) : (
                <div className="grid h-full min-h-72 place-items-center text-6xl font-black text-primary/40" aria-hidden="true">
                  {initialsOf(pick(selectedMember.name, selectedMember.nameBn))}
                </div>
              )}
            </div>
            <div className="team-modal-card__body">
              <span className="team-card__role">
                {language === "bn" && selectedMember.roleBn ? selectedMember.roleBn : selectedMember.role}
              </span>
              <h3 id="team-member-modal-title" className="team-modal-card__title">
                {pick(selectedMember.name, selectedMember.nameBn)}
              </h3>
              {(language === "bn" ? selectedMember.bioBn || selectedMember.bio : selectedMember.bio) && (
                <p className="team-modal-card__bio">
                  {language === "bn" ? selectedMember.bioBn || selectedMember.bio : selectedMember.bio}
                </p>
              )}
              <div className="team-modal-card__actions">
                <a
                  href={`mailto:${BRAND.email}?subject=${encodeURIComponent(`Rong Dhonu — ${pick(selectedMember.name, selectedMember.nameBn)}`)}`}
                  className="btn-primary"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {t("emailUs")}
                </a>
                <span className="team-modal-card__email">{BRAND.email}</span>
              </div>
            </div>
          </article>
        )}
      </ContentDetailModal>
    </section>
  );
}
