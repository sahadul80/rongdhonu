/** Round photo, or the person's initials when there's no photo yet. */
export default function Avatar({ name, photoUrl, size = 40 }: { name: string; photoUrl: string | null; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const style = { width: size, height: size };

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- CMS photos are arbitrary data URIs, not static assets
      <img src={photoUrl} alt={name} style={style} className="shrink-0 rounded-full border border-border object-cover" />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary"
    >
      {initials || "?"}
    </span>
  );
}
