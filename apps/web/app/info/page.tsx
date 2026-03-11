"use client";

import { FileText, Scale, Wrench, Github } from "lucide-react";

const team = [
  {
    name: "Xintao Hu",
    role: "Product",
    focus: "App design & engineering",
    icon: FileText,
    accent: "olive" as const,
  },
  {
    name: "Dan Jackson",
    role: "Legal support",
    focus: "Policy review, attorney replies",
    icon: Scale,
    accent: "terra" as const,
  },
  {
    name: "Eric Lai",
    role: "Full-stack",
    focus: "Next.js + Express + Mongo",
    icon: Wrench,
    accent: "muted" as const,
  },
];

export default function InfoPage() {
  return (
    <div className="mb-4">
      <section className="page-header-section">
        <span className="landing-eyebrow">About</span>
        <h1 className="qa-page-title">Team & Credits</h1>
        <p className="qa-page-sub">
          Helping Boston renters understand their rights.
        </p>
      </section>

      <div
        className="small text-secondary mb-3 fw-semibold"
        style={{ letterSpacing: "0.08em" }}
      >
        TEAM
      </div>
      <div className="row g-4 mb-4">
        {team.map((member) => (
          <div className="col-md-6 col-lg-4" key={member.name}>
            <div className="info-team-card">
              <div
                className={`info-team-icon info-team-icon--${member.accent}`}
              >
                <member.icon size={20} />
              </div>
              <div className="fw-bold mb-1">{member.name}</div>
              <span className="info-role-pill mb-2">{member.role}</span>
              <div className="text-secondary small mt-2">{member.focus}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="d-flex justify-content-center mt-5 mb-5"
        style={{ paddingTop: "2rem" }}
      >
        <a
          href="https://github.com/leaseqa"
          target="_blank"
          rel="noreferrer"
          className="text-decoration-none"
          aria-label="Visit LeaseQA on GitHub"
        >
          <Github size={48} className="text-secondary" />
        </a>
      </div>
    </div>
  );
}
