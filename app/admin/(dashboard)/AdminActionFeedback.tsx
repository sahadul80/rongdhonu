"use client";

interface AdminActionFeedbackProps {
  message: { ok: boolean; text: string } | null;
}

export default function AdminActionFeedback({
  message,
}: AdminActionFeedbackProps) {
  if (!message) return null;

  return (
    <div
      className={`admin-feedback ${message.ok ? "is-success" : "is-error"}`}
      role={message.ok ? "status" : "alert"}
      aria-live="polite"
    >
      <span className="admin-feedback__dot" aria-hidden="true" />
      <span className="min-w-0 truncate">{message.text}</span>
    </div>
  );
}
