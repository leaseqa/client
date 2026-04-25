"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Col, Row } from "react-bootstrap";
import { FaArrowRight, FaBalanceScale, FaHandsHelping, FaHome, FaTools, } from "react-icons/fa";

import { getTopicLabel } from "@/app/lib/reviewFollowUp";

const resources = [
  {
    title: "Security deposits",
    link: "https://www.mass.gov/security-deposits",
    summary: "Deposit rules, receipts, escrow, and return deadlines.",
    icon: FaBalanceScale,
  },
  {
    title: "Tenant rights",
    link: "https://www.mass.gov/info-details/tenant-rights",
    summary: "Core Massachusetts tenant protections and common issues.",
    icon: FaHome,
  },
  {
    title: "Repairs and inspections",
    link: "https://www.masslegalhelp.org/housing-apartments-shelter/repairs-bad-conditions/getting-inspection",
    summary: "What to do when housing conditions are unsafe or not fixed.",
    icon: FaTools,
  },
  {
    title: "Legal help finder",
    link: "https://www.masslegalservices.org/findlegalaid",
    summary: "Find free or low-cost legal help by county and issue.",
    icon: FaHandsHelping,
  },
];

const templates = [
  {
    label: "Notice to Repair",
    description: "Use for leaks, mold, or heating problems.",
  },
  {
    label: "Security Deposit Demand Letter",
    description: "Use when a deposit is withheld after the deadline.",
  },
  {
    label: "Roommate Agreement Addendum",
    description: "Use to set shared rules for rent, chores, and guests.",
  },
];

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "";
  const topicLabel = topic ? getTopicLabel(topic) : "";

  return (
    <div className="resources-page">
      <section className="page-header-section">
        <h1 className="qa-page-title">Read one guide or use one template.</h1>
        <p className="qa-page-sub">
          Start with a Massachusetts guide. Use a template after you know which
          rule applies.
        </p>
      </section>

      {topicLabel && (
        <section className="resources-topic-card resources-topic-inline">
          <div className="resources-topic-row">
            <div>
              <div className="resources-topic-title">
                Suggested after your lease review
              </div>
              <div className="resources-topic-copy">{topicLabel}</div>
            </div>
            <Link
              href={`/qa?scenario=${topic}`}
              className="btn-unified btn-unified-secondary btn-unified-sm"
            >
              Open this section
            </Link>
          </div>
        </section>
      )}

      <Row className="g-5 align-items-start resources-layout-row">
        <Col lg={8}>
          <section className="resources-main-card resources-content-column">
            <div className="resources-section-head">
              <h2 className="resources-section-title">Guides</h2>
              <p className="resources-section-copy">
                Start with one official guide. Then decide if you need Q&A or a
                template.
              </p>
            </div>

            <div className="resources-list-simple">
              {resources.map((item, index) => (
                <article key={item.title} className="resources-list-item">
                  <div className="resources-list-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="resources-list-copy">
                    <div className="resources-list-title">{item.title}</div>
                    <p className="resources-list-summary">{item.summary}</p>
                  </div>
                  <Link
                    href={item.link}
                    target="_blank"
                    className="resources-inline-link resources-inline-link-quiet"
                  >
                    <span>Open</span>
                    <FaArrowRight size={12}/>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </Col>

        <Col lg={4}>
          <aside className="resources-side-card resources-content-column resources-content-column-secondary">
            <div className="resources-section-head resources-section-head-compact">
              <h2 className="resources-section-title">Templates</h2>
              <p className="resources-section-copy">
                Use these after you read the guide.
              </p>
            </div>

            <div className="resources-template-list">
              {templates.map((template, index) => (
                <article
                  key={template.label}
                  className="resources-template-item"
                >
                  <div className="resources-template-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="resources-template-copy">
                    <div className="resources-template-title">
                      {template.label}
                    </div>
                    <p className="resources-template-summary">
                      {template.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </Col>
      </Row>
    </div>
  );
}
