import type { ReactElement } from "react";

/**
 * Flat illustrations for the About cards. They use the site's theme variables, so they
 * stay on-brand and readable in both light and dark mode.
 */
const frame = { viewBox: "0 0 160 100", fill: "none", role: "img", className: "h-full w-full" } as const;

function ColorPlanning() {
  const swatches: [number, string][] = [
    [-32, "var(--rd-red)"], [-16, "var(--rd-amber)"], [0, "var(--rd-green)"], [16, "var(--rd-blue)"], [32, "var(--rd-purple)"],
  ];
  return (
    <svg {...frame} aria-label="Fan of colour swatches and a paint brush">
      <g transform="translate(80 92)">
        {swatches.map(([angle, color]) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <rect x="-9" y="-78" width="18" height="74" rx="5" fill={color} />
            <rect x="-9" y="-22" width="18" height="18" rx="5" fill="var(--background)" opacity=".85" />
          </g>
        ))}
        <circle r="5" fill="var(--foreground)" />
      </g>
      <g transform="translate(128 18) rotate(35)">
        <rect x="-3" y="0" width="6" height="30" rx="3" fill="var(--muted-strong)" />
        <path d="M-5 0h10l-1-11q-4-6-8 0z" fill="var(--rd-orange)" />
      </g>
    </svg>
  );
}

function SurfacePreparation() {
  return (
    <svg {...frame} aria-label="Wall being smoothed with a trowel">
      <rect x="12" y="14" width="136" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border-color)" />
      <path d="M12 22q0-8 8-8h60v70H20q-8 0-8-8z" fill="var(--muted)" opacity=".28" />
      <path d="M22 28l8 4-6 6 9 3-5 7 8 2M40 22l5 7-7 4 8 6-6 6 7 5M58 26l6 5-6 5 8 5-7 6 7 3" stroke="var(--muted-strong)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
      <path d="M80 14h60q8 0 8 8v54q0 8-8 8H80z" fill="var(--rd-teal)" opacity=".22" />
      <g transform="translate(86 46) rotate(-14)">
        <rect x="0" y="-5" width="52" height="12" rx="3" fill="var(--muted-strong)" />
        <rect x="46" y="-17" width="7" height="30" rx="3.5" fill="var(--foreground)" opacity=".8" />
      </g>
      <path d="M84 62h52M84 70h40" stroke="var(--rd-teal)" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

function DecorativeFinishes() {
  return (
    <svg {...frame} aria-label="Marble-style decorative paint finish">
      <defs>
        <linearGradient id="marble-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--surface-2)" />
          <stop offset="1" stopColor="var(--background)" />
        </linearGradient>
      </defs>
      <rect x="14" y="10" width="132" height="80" rx="10" fill="url(#marble-bg)" stroke="var(--border-color)" />
      <path d="M14 70C44 58 52 80 82 60S122 44 146 28" stroke="var(--rd-purple)" strokeWidth="3" strokeLinecap="round" opacity=".75" />
      <path d="M14 48C40 40 56 56 80 40S124 24 146 46" stroke="var(--rd-blue)" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <path d="M40 90C52 70 70 78 86 66S112 62 128 90" stroke="var(--rd-pink)" strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
      <path d="M60 10C64 28 78 30 84 44" stroke="var(--rd-amber)" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
      <circle cx="116" cy="70" r="3" fill="var(--rd-amber)" opacity=".8" />
      <circle cx="38" cy="30" r="2" fill="var(--rd-teal)" opacity=".8" />
    </svg>
  );
}

function Transformation() {
  return (
    <svg {...frame} aria-label="House before and after repainting">
      <rect x="8" y="12" width="68" height="76" rx="8" fill="var(--surface-2)" />
      <rect x="84" y="12" width="68" height="76" rx="8" fill="color-mix(in srgb, var(--rd-amber) 18%, var(--surface-2))" />
      <g>
        <path d="M18 52l24-20 24 20z" fill="var(--muted)" opacity=".55" />
        <rect x="24" y="52" width="36" height="28" fill="var(--muted)" opacity=".4" />
        <rect x="38" y="62" width="9" height="18" fill="var(--muted-strong)" opacity=".55" />
      </g>
      <g>
        <path d="M94 52l24-20 24 20z" fill="var(--rd-red)" />
        <rect x="100" y="52" width="36" height="28" fill="var(--rd-blue)" />
        <rect x="114" y="62" width="9" height="18" fill="var(--rd-amber)" />
        <rect x="104" y="58" width="7" height="7" rx="1" fill="var(--background)" opacity=".85" />
        <path d="M143 20l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="var(--rd-yellow)" />
      </g>
      <circle cx="80" cy="50" r="10" fill="var(--background)" stroke="var(--border-color)" />
      <path d="M76 50h8m-3-3l3 3-3 3" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const ABOUT_ILLUSTRATIONS: Record<string, () => ReactElement> = {
  "Color Planning": ColorPlanning,
  "Surface Preparation": SurfacePreparation,
  "Decorative Finishes": DecorativeFinishes,
  Transformation,
};
