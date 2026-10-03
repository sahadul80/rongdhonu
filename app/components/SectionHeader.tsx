import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  titleId?: string;
  /** Smaller title scale for half-width panels (team / contact form). */
  compact?: boolean;
  className?: string;
}

export default function SectionHeader({ eyebrow, title, intro, titleId, compact = false, className = "" }: SectionHeaderProps) {
  return (
    <header className={`section-head reveal ${className}`.trim()}>
      <div className="eyebrow-row eyebrow-row--center">
        <span className="eyebrow-line" aria-hidden="true" />
        <span className="eyebrow-text">{eyebrow}</span>
        <span className="eyebrow-line" aria-hidden="true" />
      </div>
      <h2 id={titleId} className={`section-title ${compact ? "section-title--sm" : ""}`.trim()}>{title}</h2>
      {intro ? <p className="section-lead">{intro}</p> : null}
    </header>
  );
}
