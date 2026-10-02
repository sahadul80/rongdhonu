import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicCollectionPage from "@/app/components/PublicCollectionPage";
import { getActiveReviews, getActiveServices, getActiveTeam, getActiveWork, getBusinessProfile } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }): Promise<Metadata> {
  const { collection } = await params;
  const business = await getBusinessProfile();
  if (!business) return {};
  const safeBusiness = business;
  const isServices = collection === "services";
  const isReviews = collection === "reviews";
  const isWork = collection === safeBusiness.workSlug;
  const isTeam = collection === safeBusiness.teamSlug;
  if (!isServices && !isReviews && !isWork && !isTeam) return {};
  const title = isServices ? "Services" : isReviews ? "Customer Reviews" : isWork ? "Our Work" : "Our Team";
  return { title: `${title} | ${safeBusiness.name}`, alternates: { canonical: `/${collection}` }, description: `${title} from ${safeBusiness.name}.` };
}

export default async function DynamicCollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const business = await getBusinessProfile();
  if (!business) return notFound();
  const safeBusiness = business;

  if (collection === "services") return <PublicCollectionPage data={{ collection: "services", basePath: "/services", businessName: safeBusiness.name, services: await getActiveServices() }} />;
  if (collection === "reviews") return <PublicCollectionPage data={{ collection: "reviews", basePath: "/reviews", businessName: safeBusiness.name, reviews: await getActiveReviews() }} />;
  if (collection === safeBusiness.workSlug) return <PublicCollectionPage data={{ collection: "work", basePath: `/${safeBusiness.workSlug}`, businessName: safeBusiness.name, work: await getActiveWork() }} />;
  if (collection === safeBusiness.teamSlug) return <PublicCollectionPage data={{ collection: "team", basePath: `/${safeBusiness.teamSlug}`, businessName: safeBusiness.name, team: await getActiveTeam() }} />;

  notFound();
}
