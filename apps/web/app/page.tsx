"use client";

import Link from "next/link";
import useSWR from "swr";
import { Upload, MessageCircle, Scale } from "lucide-react";
import * as client from "./client";

type PostItem = {
  _id: string;
  summary: string;
  viewCount?: number;
};

type PreviewStatus = {
  label: "New" | "Active" | "Answered";
  tone: "new" | "active" | "answered";
};

const DAY_MS = 86_400_000;

const statsFetcher = async () => {
  const response = await client.fetchStats();
  if (response && response.data) {
    return [
      { label: "Open questions", value: response.data.unansweredPosts || 0 },
      { label: "Attorney replies", value: response.data.lawyerResponses || 0 },
      { label: "Recent posts", value: response.data.totalPosts || 0 },
      { label: "Notices", value: response.data.adminPosts || 0 },
    ];
  }
  return EMPTY_STATS;
};

const hotPostsFetcher = async () => {
  const response = await client.fetchPosts();
  const posts: PostItem[] = response.data || [];
  return [...posts]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);
};

const EMPTY_STATS = [
  { label: "Open questions", value: 0 },
  { label: "Attorney replies", value: 0 },
  { label: "Recent posts", value: 0 },
  { label: "Notices", value: 0 },
];

const STEPS = [
  {
    num: "01",
    icon: Upload,
    title: "Upload or paste",
    desc: "Drop a PDF or paste any clause. Our AI reads it in seconds.",
  },
  {
    num: "02",
    icon: Scale,
    title: "See what matters",
    desc: "Flagged terms are matched to Massachusetts tenant law.",
  },
  {
    num: "03",
    icon: MessageCircle,
    title: "Ask the community",
    desc: "Post follow-ups. Attorneys and tenants reply with context.",
  },
];

const getPreviewStatus = (index: number, post: PostItem): PreviewStatus => {
  if ((post.viewCount || 0) >= 25) {
    return { label: "Answered", tone: "answered" };
  }

  if (index === 0 || (post.viewCount || 0) >= 10) {
    return { label: "Active", tone: "active" };
  }

  return { label: "New", tone: "new" };
};

export default function LandingPage() {
  const { data: stats = EMPTY_STATS } = useSWR("stats/overview", statsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: DAY_MS,
    fallbackData: EMPTY_STATS,
  });

  const { data: hotPosts = [] } = useSWR("posts/hot", hotPostsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: DAY_MS,
    fallbackData: [],
  });

  return (
    <div className="landing-page">
      {/* Hero — two columns */}
      <section className="landing-hero-grid">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">For Boston renters</span>
          <h1 className="landing-hero-title">
            Read the lease.
            <br />
            Ask the <em>next</em> question.
          </h1>
          <p className="landing-hero-sub">
            LeaseQA flags the clauses that matter, points you to Massachusetts
            law, and connects you with a community that gets it.
          </p>
          <div className="landing-hero-actions">
            <Link href="/ai-review" className="landing-hero-cta">
              Check a lease
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/qa" className="landing-hero-cta-outline">
              Ask a question
            </Link>
          </div>
          <div className="landing-trust">
            <span className="landing-trust-tag">Plain language first</span>
            <span className="landing-trust-tag">Built for class use</span>
            <span className="landing-trust-tag">Not legal advice</span>
          </div>
        </div>

        {hotPosts.length > 0 && (
          <div className="landing-hero-visual">
            <div className="landing-preview-label">
              <span>Popular questions</span>
            </div>
            <div className="landing-preview-list">
              {hotPosts.map((post, i) => {
                const status = getPreviewStatus(i, post);
                return (
                <Link
                  key={post._id}
                  href={`/qa?post=${post._id}`}
                  className="landing-preview-item"
                >
                  <span
                    className={`landing-preview-dot landing-preview-dot-${status.tone}`}
                    aria-hidden
                  />
                  <span className="landing-preview-title">{post.summary}</span>
                  <span
                    className={`landing-preview-status landing-preview-status-${status.tone}`}
                  >
                    {status.label}
                  </span>
                </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="landing-how-section">
        <div className="landing-section-label">
          <h2>How it works</h2>
        </div>

        <div className="landing-how-grid">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="landing-how-step">
                <div className="landing-how-num">{step.num}</div>
                <div className="landing-how-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <h3 className="landing-how-title">{step.title}</h3>
                <p className="landing-how-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats-section">
        <div className="landing-section-label">
          <h2>Right now</h2>
        </div>

        <div className="landing-stats">
          <div className="landing-stats-header">
            <span className="landing-stats-title">Community pulse</span>
            <span className="landing-stats-live">
              <span className="landing-live-dot" />
              Live
            </span>
          </div>
          <div className="landing-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="landing-stat">
                <div className="landing-stat-val">{s.value}</div>
                <div className="landing-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
