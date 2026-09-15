"use client";

import { Compass, FileText, FlaskConical, Github, Wrench } from "lucide-react";

const team = [
  {
    names: ["Xintao Hu"],
    role: "Product",
    icon: FileText,
    accent: "olive" as const,
  },
  {
    names: ["Chenyan Jia", "Dan Jackson"],
    role: "Advisor",
    icon: Compass,
    accent: "terra" as const,
  },
  {
    names: ["Eric Lai"],
    role: "Full-stack",
    icon: Wrench,
    accent: "muted" as const,
  },
  {
    names: ["Zhihao Qian", "Tianze Li"],
    role: "Research",
    icon: FlaskConical,
    accent: "olive" as const,
  },
];

export default function InfoPage() {
  return (
    <div className="mb-4">
      <section className="page-header-section">
        <span className="landing-eyebrow">About</span>
        <h1 className="qa-page-title">Team &amp; credits</h1>
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
          <div className="col-md-6 col-lg-3" key={member.role}>
            <div className="info-team-card">
              <div
                className={`info-team-icon info-team-icon--${member.accent}`}
              >
                <member.icon size={20}/>
              </div>
              <div className="mb-1">
                {member.names.map((name) => (
                  <div className="fw-bold" key={name}>
                    {name}
                  </div>
                ))}
              </div>
              <span className="info-role-pill mt-auto">{member.role}</span>
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
          <Github size={48} className="text-secondary"/>
        </a>
      </div>
    </div>
  );
}
