import { Suspense } from "react";
import AnimatedLogoLoader from "./components/AnimatedLogoLoader";
import CriticalHero from "./components/CriticalHero";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<AnimatedLogoLoader />}>
        <CriticalHero />
      </Suspense>
    </div>
  );
}
