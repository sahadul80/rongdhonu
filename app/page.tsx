"use client";

import { useState } from "react";
import RongDhonuRenovationPage from "./components/RongDhonuRenovationPage";
import AnimatedLogoLoader from "./components/AnimatedLogoLoader";

export default function Page() {
  const [loading, setLoading] = useState(true);
  return (
    <>
      {loading && <AnimatedLogoLoader duration={2000} onComplete={() => setLoading(false)} />}
      <RongDhonuRenovationPage />
    </>
  );
}
