import "server-only";
import { query } from "./db";

export interface DashboardSummary {
  counts: {
    services: number;
    activeServices: number;
    team: number;
    activeTeam: number;
    reviews: number;
    activeReviews: number;
    newEnquiries: number;
    work: number;
    activeWork: number;
  };
  /** Most recently added reviews (visible or hidden), newest first. */
  latestReviews: { id: number; name: string; role: string | null; text: string; active: boolean }[];
  /** Team in display order (visible or hidden). */
  team: { id: number; name: string; role: string; photoUrl: string | null; active: boolean }[];
}

const LATEST_REVIEWS = 3;
const TEAM_PREVIEW = 6;

/** Snapshot shown on the admin dashboard home. */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [counts] = await query<Record<string, string>>(
    `SELECT
       (SELECT count(*) FROM services) AS services,
       (SELECT count(*) FROM services WHERE active) AS active_services,
       (SELECT count(*) FROM team_members) AS team,
       (SELECT count(*) FROM team_members WHERE active) AS active_team,
       (SELECT count(*) FROM reviews) AS reviews,
       (SELECT count(*) FROM reviews WHERE active) AS active_reviews,
       (SELECT count(*) FROM contact_submissions WHERE status = 'new') AS new_enquiries,
       (SELECT count(*) FROM work_items) AS work,
       (SELECT count(*) FROM work_items WHERE active) AS active_work`
  );
  const latestReviews = await query<{ id: number; name: string; role: string | null; text_en: string; active: boolean }>(
    "SELECT id, name, role, text_en, active FROM reviews ORDER BY id DESC LIMIT $1",
    [LATEST_REVIEWS]
  );
  const team = await query<{ id: number; name: string; role: string; photo_url: string | null; active: boolean }>(
    "SELECT id, name, role, photo_url, active FROM team_members ORDER BY sort_order ASC, id ASC LIMIT $1",
    [TEAM_PREVIEW]
  );

  return {
    counts: {
      services: Number(counts.services),
      activeServices: Number(counts.active_services),
      team: Number(counts.team),
      activeTeam: Number(counts.active_team),
      reviews: Number(counts.reviews),
      activeReviews: Number(counts.active_reviews),
      newEnquiries: Number(counts.new_enquiries),
      work: Number(counts.work),
      activeWork: Number(counts.active_work),
    },
    latestReviews: latestReviews.map((r) => ({ id: r.id, name: r.name, role: r.role, text: r.text_en, active: r.active })),
    team: team.map((r) => ({ id: r.id, name: r.name, role: r.role, photoUrl: r.photo_url, active: r.active })),
  };
}
