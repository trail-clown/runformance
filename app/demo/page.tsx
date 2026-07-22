import type { Metadata } from "next";
import Link from "next/link";
import styles from "./demo.module.css";

export const metadata: Metadata = {
  title: "OpenAI Build Week Demo | RunFormance",
  description:
    "The original RunFormance demonstration video submitted for OpenAI Build Week.",
};

export default function DemoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <section className={styles.content}>
        <Link className={styles.brand} href="/" aria-label="RunFormance home">
          <span className={styles.mark}>RF</span>
          <span>RunFormance</span>
        </Link>

        <div className={styles.intro}>
          <p className={styles.tagline}>
            Better Runs. Better Recovery. Better Health.
          </p>
          <h1>OpenAI Build Week — RunFormance Demo</h1>
          <p className={styles.description}>
            This is the original demonstration video submitted with RunFormance
            for OpenAI Build Week.
          </p>
        </div>

        <div className={styles.videoFrame}>
          <video
            className={styles.video}
            controls
            playsInline
            preload="metadata"
          >
            <source
              src="/demo/runformance-build-week-demo.mp4"
              type="video/mp4"
            />
            Your browser does not support the video element.
          </video>
        </div>

        <Link className={styles.backLink} href="/">
          ← Back to RunFormance
        </Link>
      </section>
    </main>
  );
}
