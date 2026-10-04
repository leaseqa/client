"use client";

import { Github } from "lucide-react";

const team = [
  { names: ["Xintao Hu"], role: "Product" },
  { names: ["Chenyan Jia", "Dan Jackson"], role: "Advisor" },
  { names: ["Eric Lai"], role: "Full-stack" },
  { names: ["Zhihao Qian", "Tianze Li"], role: "Research" },
];

export default function InfoPage() {
  return (
    <div className="info-page">
      <section className="page-header-section">
        <span className="landing-eyebrow">About</span>
        <h1 className="qa-page-title">Team &amp; credits</h1>
        <p className="qa-page-sub">
          Helping Boston renters understand their rights.
        </p>
      </section>

      <section className="info-team" aria-labelledby="info-team-title">
        <h2 id="info-team-title" className="info-section-label">Team</h2>
        <ul className="info-team-grid">
          {team.map((member) => (
            <li className="info-team-card" key={member.role}>
              <span className="info-role-pill">{member.role}</span>
              {member.names.map((name) => (
                <span className="info-team-name" key={name}>
                  {name}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </section>

      <a
        href="https://github.com/leaseqa"
        target="_blank"
        rel="noreferrer"
        className="info-source-link"
      >
        <Github size={18} aria-hidden="true"/>
        <span>Source code on GitHub</span>
      </a>
    </div>
  );
}
