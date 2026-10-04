import React from "react";
import Link from "next/link";

import styles from "./home.module.css";

const JOURNEY_STEPS = [
  {
    label: "01",
    title: "Bring the exact wording",
    description: "Upload a lease or paste the clause you are unsure about.",
  },
  {
    label: "02",
    title: "See the relevant guidance",
    description:
      "Read a plain-language explanation with cited tenant guidance.",
  },
  {
    label: "03",
    title: "Identify what to verify",
    description:
      "Review relevant questions, cited sources, and available options.",
  },
];

export default function HomeJourney() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <span className={styles.eyebrow}>For Massachusetts renters</span>
        <h1 id="home-title" className={styles.title}>
          Understand your lease.
          <br />
          <em>Know what to check.</em>
        </h1>

        <div className={styles.heroBody}>
          <div className={styles.heroCopy}>
            <p className={styles.subtitle}>
              LeaseQA explains lease language, surfaces relevant Massachusetts
              tenant guidance, and helps you identify sources and questions for
              further review.
            </p>
            <div className={styles.actions}>
              <Link href="/ai-review" className={styles.primaryAction}>
                Review my lease <span aria-hidden="true">→</span>
              </Link>
              <Link href="/qa" className={styles.secondaryAction}>
                Browse renter questions
              </Link>
            </div>
          </div>

          <article
            className={styles.preview}
            aria-label="Example lease guidance comparison"
          >
            <header className={styles.previewHeader}>
              <span>Lease review · example</span>
              <span className={styles.previewStatus}>
                Compare with guidance
              </span>
            </header>
            {/* The clause keeps its own section number in the margin, the way
                the lease prints it; the highlighter marks the words to check. */}
            <div className={styles.clause}>
              <span className={styles.clauseNumber}>§&nbsp;4</span>
              <div>
                <div className={styles.clauseLabel}>Security deposit</div>
                <p className={styles.clauseText}>
                  Tenant shall pay a security deposit equal to{" "}
                  <mark>two months’ rent</mark> before move-in.
                </p>
              </div>
            </div>
            <div className={styles.guidance}>
              <strong>What the cited guidance says</strong>
              <p>
                A landlord generally may collect no more than one month’s rent
                as a security deposit.
              </p>
            </div>
            <div className={styles.verifyQuestion}>
              <span className={styles.questionMark} aria-hidden="true">
                ?
              </span>
              <div>
                <span className={styles.questionLabel}>Question to verify</span>
                <p>
                  Does the deposit amount in this clause match the limit
                  described in the cited Massachusetts guidance?
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.journey} aria-labelledby="journey-title">
        <h2 id="journey-title" className={styles.journeyTitle}>
          From clause to context
        </h2>
        <ol className={styles.steps}>
          {JOURNEY_STEPS.map((step) => (
            <li key={step.label} className={styles.step}>
              <span className={styles.stepNumber}>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
