import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="thanks-page">
      <section className="thanks-card">
        <div className="thanks-mark">RF</div>
        <span className="thanks-kicker">Beta waitlist</span>
        <h1>You’re on the list!</h1>
        <p>
          Thanks for your interest in RunFormance. We’re inviting a small group
          of runners to help shape the beta. We’ll be in touch with TestFlight
          access and next steps.
        </p>
        <Link href="/" className="thanks-button">
          Keep exploring RunFormance
        </Link>
      </section>
    </main>
  );
}
