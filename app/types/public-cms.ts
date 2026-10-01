export interface BusinessPublicSummary {
  name: string;
  shortName: string;
  tagline: string;
  teamSlug: string;
  workSlug: string;
  hasTeam: boolean;
  hasWork: boolean;
}

export interface CmsBusiness {
  name: string;
  shortName: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  addressBn?: string | null;
  mapQuery: string;
  logoUrl: string | null;
  logoReversedUrl: string | null;
  iconUrl: string | null;
  teamSlug: string;
  workSlug: string;
}

export interface CmsService {
  id: string;
  name: string;
  nameBn?: string | null;
  category: string;
  categoryBn?: string | null;
  description: string;
  descriptionBn?: string | null;
  bestFor: string;
  bestForBn?: string | null;
  accent: string;
  imageUrl: string | null;
}

export interface CmsReview {
  id: number;
  name: string;
  role: string | null;
  roleBn?: string | null;
  textEn: string;
  textBn: string | null;
  workId: number | null;
}

export interface CmsTeamMember {
  id: number;
  slug: string;
  name: string;
  nameBn?: string | null;
  role: string;
  roleBn: string | null;
  bio: string | null;
  bioBn: string | null;
  photoUrl: string | null;
}

export interface CmsWork {
  id: number;
  slug: string;
  title: string;
  titleBn?: string | null;
  category: string;
  categoryBn?: string | null;
  description: string;
  descriptionBn?: string | null;
  clientName?: string | null;
  location?: string | null;
  year?: number | null;
  imageUrl: string | null;
}

export interface CmsHeroImage {
  description: string;
  slot: string;
  label: string;
  imageUrl: string | null;
}
