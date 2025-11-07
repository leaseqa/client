"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type FolderKey =
  | "lease_review"
  | "security_deposit"
  | "maintenance"
  | "eviction"
  | "utilities"
  | "roommate_disputes"
  | "lease_termination"
  | "rent_increase"
  | "other";

const folders: Record<FolderKey, string> = {
  lease_review: "Lease Review",
  security_deposit: "Security Deposits",
  maintenance: "Maintenance Duties",
  eviction: "Evictions & Terminations",
  utilities: "Utilities",
  roommate_disputes: "Roommate Disputes",
  lease_termination: "Early Termination",
  rent_increase: "Rent Increases",
  other: "Other",
};

type PostSummary = {
  id: string;
  title: string;
  author: string;
  role: "tenant" | "lawyer";
  folder: FolderKey;
  createdAt: string;
  excerpt: string;
};

const mockPosts: PostSummary[] = [
  {
    id: "1",
    title: "Is it legal for a landlord to collect three months of rent upfront?",
    author: "Ava Chen",
    role: "tenant",
    folder: "lease_review",
    createdAt: "2024-10-25T08:00:00Z",
    excerpt: "Lease asks for three months of rent plus a deposit before move-in. Feels excessive…",
  },
  {
    id: "2",
    title: "Who pays for the leaking pipe repair?",
    author: "Attorney Lin",
    role: "lawyer",
    folder: "maintenance",
    createdAt: "2024-10-24T15:12:00Z",
    excerpt: "Tenant should notify immediately and keep receipts. Massachusetts rules below…",
  },
];

const boardStats = [
  { label: "Unread posts", value: 4 },
  { label: "Unanswered", value: 6 },
  { label: "Attorney replies", value: 32 },
  { label: "Tenant replies", value: 256 },
  { label: "Registered users", value: 512 },
  { label: "AI reviews linked", value: 14 },
];

export default function QAPage() {
  const [activeFolder, setActiveFolder] = useState<FolderKey>("lease_review");

  const filteredPosts = useMemo(
    () => mockPosts.filter((post) => post.folder === activeFolder),
    [activeFolder],
  );
  const featuredPost = filteredPosts[0] ?? mockPosts[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr_320px]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-4">
            <header className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>Folders</span>
              <button className="text-[11px] text-slate-400 hover:text-white">Manage</button>
            </header>
            <ul className="mt-4 space-y-2">
              {(Object.entries(folders) as [FolderKey, string][]).map(([key, label]) => (
                <li key={key}>
                  <button
                    onClick={() => setActiveFolder(key)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                      key === activeFolder
                        ? "border-[var(--accent-blue)] bg-[var(--pill-bg-strong)] text-white shadow-lg"
                        : "border-white/5 bg-black/10 text-slate-300 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[11px] uppercase tracking-wide text-slate-500">View</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <StatsBar />
        </aside>

        <section className="space-y-4">
          <header className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--pill-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-highlight)]">
                Q&A
              </span>
              <h1 className="text-xl font-semibold text-white">Housing forum · Piazza-style</h1>
              <div className="ml-auto flex gap-2">
              <Link
                href="/qa/new"
                className="rounded-xl bg-[var(--accent-blue)] px-3 py-1.5 text-sm font-medium text-white shadow-lg hover:bg-[var(--accent-blue-hover)]"
              >
                New Post
              </Link>
                <Link
                  href="/qa"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
                >
                  Refresh
                </Link>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Showing {filteredPosts.length || "0"} posts in <strong>{folders[activeFolder]}</strong>.
              Threads inherit styling from the captured Piazza reference.
            </p>
          </header>

          <div className="space-y-3">
            {filteredPosts.length === 0 && (
              <EmptyHint message="No posts in this folder yet. Be the first to share a question or insight." />
            )}
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/qa/${post.id}`}
                className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-4 transition hover:border-[var(--accent-blue)] hover:bg-[var(--pill-bg-strong)]/40"
              >
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="rounded bg-[var(--pill-counter)] px-2 py-0.5 text-[11px] uppercase tracking-wide">
                    {post.role === "lawyer" ? "Attorney" : "Tenant"}
                  </span>
                  <span>{folders[post.folder]}</span>
                  <span>· {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-white">{post.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{post.excerpt}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{post.author}</span>
                  <span className="flex items-center gap-1 text-[var(--accent-cyan)]">Open thread →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <PostPreview post={featuredPost} />
          <div className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-4 text-sm text-slate-300">
            <h3 className="text-base font-semibold text-white">Need to escalate?</h3>
            <p className="mt-2">
              Use the AI lease review to pre-fill summaries, then bring the conversation back here for peer
              review.
            </p>
            <Link
              href="/ai-review"
              className="mt-3 inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Launch AI workflow →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PostPreview({ post }: { post?: PostSummary }) {
  if (!post) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[var(--app-panel)] p-4 text-sm text-slate-400">
        Select a post to preview its details.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-5 shadow-lg shadow-black/20">
      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Preview</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{post.title}</h2>
      <p className="mt-1 text-xs text-slate-500">
        {post.author} · {post.role === "lawyer" ? "⚖️ Attorney" : "🏠 Tenant"}
      </p>
      <p className="mt-4 text-sm text-slate-300">{post.excerpt}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">132 views</span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">4 followers</span>
      </div>
      <Link
        href={`/qa/${post.id}`}
        className="mt-4 inline-flex items-center rounded-xl bg-[var(--accent-blue)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-blue-hover)]"
      >
        View full thread
      </Link>
    </div>
  );
}

function StatsBar() {
  return (
    <section className="grid gap-3 rounded-2xl border border-white/5 bg-[var(--app-panel)] p-4 sm:grid-cols-2">
      {boardStats.map((item) => (
        <div key={item.label} className="rounded-xl border border-white/5 bg-black/10 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </section>
  );
}

function EmptyHint({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[var(--app-panel)] p-6 text-sm text-slate-400">
      {message}
    </div>
  );
}
