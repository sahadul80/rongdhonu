import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicDetailPage from "@/app/components/PublicDetailPage";
import { getBusinessProfile, getReviewBySlug, getReviewsForWork, getServiceBySlug, getTeamBySlug, getWorkBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ collection: string; slug: string }> }): Promise<Metadata> {
  const { collection, slug } = await params;
  const business = await getBusinessProfile();
  if (!business) return {};
  const safeBusiness = business;

  if (collection === "services") {
    const item = await getServiceBySlug(slug); if (!item) return {};
    return { title: item.name, description: item.description, alternates: { canonical: `/services/${item.slug}` } };
  }
  if (collection === "reviews") {
    const item = await getReviewBySlug(slug); if (!item) return {};
    return { title: `${item.name} — Client Review`, description: item.textEn, alternates: { canonical: `/reviews/${item.slug}` } };
  }
  if (collection === safeBusiness.workSlug) {
    const item = await getWorkBySlug(slug); if (!item) return {};
    return { title: item.title, description: item.description, alternates: { canonical: `/${safeBusiness.workSlug}/${item.slug}` } };
  }
  if (collection === safeBusiness.teamSlug) {
    const item = await getTeamBySlug(slug); if (!item) return {};
    return { title: item.name, description: item.bio || `${item.name} at ${safeBusiness.name}.`, alternates: { canonical: `/${safeBusiness.teamSlug}/${item.slug}` } };
  }
  return {};
}

export default async function DynamicDetailPage({ params }: { params: Promise<{ collection: string; slug: string }> }) {
  const { collection, slug } = await params;
  const business = await getBusinessProfile();
  if (!business) return notFound();
  const safeBusiness = business;

  if (collection === "services") {
    const service = await getServiceBySlug(slug); if (!service) return notFound();
    return <PublicDetailPage data={{ kind: "service", basePath: "/services", businessEmail: safeBusiness.email, service }} />;
  }
  if (collection === "reviews") {
    const review = await getReviewBySlug(slug); if (!review) return notFound();
    return <PublicDetailPage data={{ kind: "review", basePath: "/reviews", workBasePath: `/${safeBusiness.workSlug}`, businessEmail: safeBusiness.email, review }} />;
  }
  if (collection === safeBusiness.workSlug) {
    const work = await getWorkBySlug(slug); if (!work) return notFound();
    const reviews = await getReviewsForWork(work.id);
    return <PublicDetailPage data={{ kind: "work", basePath: `/${safeBusiness.workSlug}`, businessEmail: safeBusiness.email, work: { ...work, reviews } }} />;
  }
  if (collection === safeBusiness.teamSlug) {
    const team = await getTeamBySlug(slug); if (!team) return notFound();
    return <PublicDetailPage data={{ kind: "team", basePath: `/${safeBusiness.teamSlug}`, businessEmail: safeBusiness.email, team }} />;
  }
  notFound();
}
