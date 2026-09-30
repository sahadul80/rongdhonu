# Rong Dhonu runtime/type regression fix

## Fixed

- `WorkSection`: moved `relatedReviews` / `reviewsLoading` state and both effects ahead of conditional returns. The `setRelatedReviews` setter is initialized before it is used, and hook order is stable on every render.
- `RongDhonuRenovationPage`: supplies `business` to `Navbar` and `ContactTeamSection`, and `business` plus `initialHero` to `Hero`. The wrapper also supports callers that provide neither value by loading the critical data itself.

## Verification

- 102 implementation files (`.ts`, `.tsx`, `.mts`, `.cts`) transpiled with zero TypeScript parser/transform diagnostics.
- Static checks confirmed the affected hook ordering and required prop calls.
- No project source files were removed for this repair.
- ZIP integrity passed.

`next-env.d.ts` is a declaration file and was intentionally excluded from the `transpileModule` implementation-file check; it is not executable source. A full Next.js production build requires installed project dependencies, which are not included in the working archive.
