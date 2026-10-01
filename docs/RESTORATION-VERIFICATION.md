# Rong Dhonu — source restoration verification

This package was reconciled from the original `rongdhonu-baseline(1).zip` and the latest optimized source.

## Source preservation

- All original project source/config files from the original upload are present.
- Original macOS `.DS_Store` metadata is intentionally excluded from the distribution archive.
- `tsconfig.tsbuildinfo` is retained.
- Performance additions are layered on top instead of replacing the original project tree.

## Specific destructive replacements restored

- `app/admin/(dashboard)/page.tsx` — restored full dashboard implementation (8,490 bytes).
- `app/components/RongDhonuRenovationPage.tsx` — restored full legacy wrapper (1,192 bytes).
- `app/components/useCmsContent.ts` — restored complete CMS type/context compatibility surface, while making its request post-mount so it cannot block first render.
- `app/components/BannerSection.tsx` — restored CMS-aware banner behavior using the section-scoped public hero API.
- `ServicesSection`, `TeamSection`, and `WorkSection` — restored their richer original UI and adapted them to viewport-scoped APIs with component skeletons.

## Performance additions retained

- Individual section lazy JS/data loading.
- Admin route skeleton loading.
- Neon/Postgres connection improvements.
- Contact validation and rate-limit migration.
- Apple touch icon files.
- Public API routes for business, hero images, process, reviews, services, team and work.

## Mechanical checks

- 100 original non-metadata source/config files checked against the reconciled project: 0 missing.
- All TypeScript/TSX source files (excluding `next-env.d.ts`) transpiled with TypeScript 5.8.3: 0 syntax failures.
- Archive integrity verified with `unzip -t`.
