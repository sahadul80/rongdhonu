import LazyLandingSections from "./LazyLandingSections";
import type { BusinessPublicSummary } from "@/app/types/public-cms";

export default function RongDhonuRenovationPageContent({ business }: { business: BusinessPublicSummary | null }) {
  return <LazyLandingSections business={business} />;
}
