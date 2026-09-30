export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const IMAGE_DATA_RE =
  /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i;

const HTTP_URL_RE = /^https?:\/\/\S+$/i;

const MAX_SORT_ORDER = 9_999;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown): string {
  return text(value);
}

export function isValidEmail(value: string): boolean {
  const clean = value.trim();

  return clean.length <= 200 && EMAIL_RE.test(clean);
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  const clean = value.trim();

  return clean.length >= 2 && clean.length <= 80 && SLUG_RE.test(clean);
}

export function isOptionalHttpUrl(value: string): boolean {
  const clean = value.trim();

  return !clean || (clean.length <= 200 && HTTP_URL_RE.test(clean));
}

export function isValidImageDataUri(value: unknown): value is string {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && IMAGE_DATA_RE.test(value))
  );
}

export function parseSortOrder(value: unknown): number {
  const parsed =
    typeof value === "number" ? value : Number(String(value ?? ""));

  if (!Number.isFinite(parsed)) return 0;

  return Math.max(
    0,
    Math.min(MAX_SORT_ORDER, Math.trunc(parsed)),
  );
}

export function validateSortOrder(value: unknown): ValidationResult {
  const raw = String(value ?? "").trim();

  if (!raw) return { ok: true };

  const parsed = Number(raw);

  if (
    !Number.isInteger(parsed) ||
    parsed < 0 ||
    parsed > MAX_SORT_ORDER
  ) {
    return {
      ok: false,
      message: `Order must be a whole number from 0 to ${MAX_SORT_ORDER}.`,
    };
  }

  return { ok: true };
}

export interface BusinessFormValue {
  name: string;
  shortName: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  addressBn: string | null;
  mapQuery: string;
  logoUrl: string | null;
  logoReversedUrl: string | null;
  iconUrl: string | null;
  teamSlug: string;
  workSlug: string;
}

export function validateBusinessForm(
  value: BusinessFormValue,
): ValidationResult {
  const name = text(value.name);
  const phone = text(value.phone);
  const email = text(value.email);
  const address = text(value.address);

  if (!name) {
    return {
      ok: false,
      message: "Business name is required.",
    };
  }

  if (name.length > 200) {
    return {
      ok: false,
      message: "Business name is too long.",
    };
  }

  if (!phone) {
    return {
      ok: false,
      message: "Phone is required.",
    };
  }

  if (phone.length > 60) {
    return {
      ok: false,
      message: "Phone is too long.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      ok: false,
      message: "Enter a valid email address.",
    };
  }

  if (!address) {
    return {
      ok: false,
      message: "Address is required.",
    };
  }

  if (address.length > 400) {
    return {
      ok: false,
      message: "Address is too long.",
    };
  }

  if (!isOptionalHttpUrl(value.website)) {
    return {
      ok: false,
      message: "Website must start with http:// or https://.",
    };
  }

  if (!isValidSlug(value.teamSlug)) {
    return {
      ok: false,
      message:
        "Our Team slug must use lowercase letters, numbers and single hyphens.",
    };
  }

  if (!isValidSlug(value.workSlug)) {
    return {
      ok: false,
      message:
        "Our Work slug must use lowercase letters, numbers and single hyphens.",
    };
  }

  for (const [label, image] of [
    ["Logo", value.logoUrl],
    ["Dark/reversed logo", value.logoReversedUrl],
    ["Icon", value.iconUrl],
  ] as const) {
    if (!isValidImageDataUri(image)) {
      return {
        ok: false,
        message: `${label} must be a supported base64 image.`,
      };
    }
  }

  return { ok: true };
}

export interface ServiceFormValue {
  name: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  description: string;
  descriptionBn: string;
  bestFor: string;
  bestForBn: string;
  accent: string;
  imageUrl: string | null;
}

export function validateServiceForm(
  value: ServiceFormValue,
): ValidationResult {
  if (!text(value.name)) {
    return {
      ok: false,
      message: "Service name is required.",
    };
  }

  if (text(value.name).length > 200) {
    return {
      ok: false,
      message: "Service name is too long.",
    };
  }

  if (!text(value.category)) {
    return {
      ok: false,
      message: "Service category is required.",
    };
  }

  if (text(value.category).length > 100) {
    return {
      ok: false,
      message: "Service category is too long.",
    };
  }

  if (!text(value.description)) {
    return {
      ok: false,
      message: "Service description is required.",
    };
  }

  if (text(value.description).length > 1000) {
    return {
      ok: false,
      message: "Service description is too long.",
    };
  }

  if (!isValidImageDataUri(value.imageUrl)) {
    return {
      ok: false,
      message: "Service image must be a supported base64 image.",
    };
  }

  return { ok: true };
}

export interface TeamFormValue {
  slug: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  bio: string;
  bioBn: string;
  photoUrl: string | null;
}

export function validateTeamForm(
  value: TeamFormValue,
): ValidationResult {
  if (!isValidSlug(value.slug)) {
    return {
      ok: false,
      message:
        "Team slug must use lowercase letters, numbers and single hyphens.",
    };
  }

  if (!text(value.name)) {
    return {
      ok: false,
      message: "Team member name is required.",
    };
  }

  if (text(value.name).length > 160) {
    return {
      ok: false,
      message: "Team member name is too long.",
    };
  }

  if (!text(value.role)) {
    return {
      ok: false,
      message: "Team member role is required.",
    };
  }

  if (text(value.role).length > 120) {
    return {
      ok: false,
      message: "Team member role is too long.",
    };
  }

  if (!isValidImageDataUri(value.photoUrl)) {
    return {
      ok: false,
      message: "Team photo must be a supported base64 image.",
    };
  }

  return { ok: true };
}

export interface ReviewFormValue {
  name: string;
  role: string;
  roleBn: string;
  textEn: string;
  textBn: string;
}

export function validateReviewForm(
  value: ReviewFormValue,
): ValidationResult {
  if (!text(value.name)) {
    return {
      ok: false,
      message: "Reviewer name is required.",
    };
  }

  if (text(value.name).length > 160) {
    return {
      ok: false,
      message: "Reviewer name is too long.",
    };
  }

  if (!text(value.textEn)) {
    return {
      ok: false,
      message: "English review text is required.",
    };
  }

  if (text(value.textEn).length > 1000) {
    return {
      ok: false,
      message: "English review text is too long.",
    };
  }

  return { ok: true };
}

export function validateLoginForm(
  email: string,
  password: string,
): ValidationResult {
  if (!isValidEmail(text(email))) {
    return {
      ok: false,
      message: "Enter a valid email address.",
    };
  }

  if (!text(password)) {
    return {
      ok: false,
      message: "Password is required.",
    };
  }

  return { ok: true };
}

export interface ContactFormValue {
  name: string;
  email: string;
  phone: string;
  serviceInterest: string;
  message: string;
}

export function validateContactForm(
  value: ContactFormValue,
): ValidationResult {
  if (!text(value.name)) {
    return {
      ok: false,
      message: "Name is required.",
    };
  }

  if (!isValidEmail(text(value.email))) {
    return {
      ok: false,
      message: "Enter a valid email address.",
    };
  }

  if (!text(value.message)) {
    return {
      ok: false,
      message: "Message is required.",
    };
  }

  return { ok: true };
}

export interface WorkFormValue {
  slug: string;
  title: string;
  titleBn: string;
  category: string;
  categoryBn: string;
  description: string;
  descriptionBn: string;
  clientName: string;
  location: string;
  year: string;
  imageUrl: string | null;
}

export function validateWorkForm(
  value: WorkFormValue,
): ValidationResult {
  if (!isValidSlug(value.slug)) {
    return {
      ok: false,
      message:
        "Work slug must use lowercase letters, numbers and single hyphens.",
    };
  }

  if (!text(value.title)) {
    return {
      ok: false,
      message: "Work title is required.",
    };
  }

  if (text(value.title).length > 200) {
    return {
      ok: false,
      message: "Work title is too long.",
    };
  }

  if (!text(value.category)) {
    return {
      ok: false,
      message: "Work category is required.",
    };
  }

  if (!text(value.description)) {
    return {
      ok: false,
      message: "Work description is required.",
    };
  }

  if (text(value.description).length > 1200) {
    return {
      ok: false,
      message: "Work description is too long.",
    };
  }

  const year = text(value.year);

  if (
    year &&
    (!/^\d{4}$/.test(year) ||
      Number(year) < 1900 ||
      Number(year) > 2200)
  ) {
    return {
      ok: false,
      message: "Year must be a valid four-digit year.",
    };
  }

  if (!isValidImageDataUri(value.imageUrl)) {
    return {
      ok: false,
      message: "Work image must be a supported base64 image.",
    };
  }

  return { ok: true };
}