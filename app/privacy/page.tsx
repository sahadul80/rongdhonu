import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-xs font-black uppercase tracking-[0.18em] text-primary">← Rong Dhonu</Link>
        <h1 className="mt-5 text-3xl font-black uppercase tracking-tight">Privacy & Form Data Notice</h1>
        <p className="mt-3 text-sm leading-6 text-muted-strong">This page explains how the public website handles information supplied through enquiries and work reviews.</p>
        <section id="forms" className="mt-8 space-y-5 text-sm leading-7 text-muted-strong">
          <div><h2 className="font-black text-foreground">Form information</h2><p className="mt-1">When you submit an enquiry or work review, the information you provide is stored so Rong Dhonu can respond, moderate website reviews, and maintain the review associated with the selected work.</p></div>
          <div><h2 className="font-black text-foreground">Browser profile cookie</h2><p className="mt-1">After a successful public-form submission, the site saves your name, email address and phone number in a secure, HttpOnly browser cookie for up to 180 days. The saved profile is used only to prefill future public forms on this website. Review text and enquiry messages are not placed in this cookie.</p></div>
          <div><h2 className="font-black text-foreground">Google and Apple</h2><p className="mt-1">You may choose Google or Apple to provide basic identity information for public forms. The provider's own consent and authentication screens determine what information is shared. The site stores only the profile fields needed for the form experience.</p></div>
          <div><h2 className="font-black text-foreground">Your control</h2><p className="mt-1">You can decline the public-form consent checkbox, manually edit the fields, or clear the saved browser profile from the form's consent panel. Deleting a browser profile does not delete an enquiry or review already submitted.</p></div>
          <div className="rounded-2xl border border-border bg-background p-4 text-xs">This website notice is an implementation-level privacy summary, not legal advice. The business should have the final public privacy notice reviewed for its jurisdiction and retention requirements before launch.</div>
        </section>
      </div>
    </main>
  );
}
