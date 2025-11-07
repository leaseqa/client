import Link from "next/link";

const folderFilters = [
  { key: "lease_review", label: "Lease review", unread: 8 },
  { key: "security_deposit", label: "Deposits", unread: 5 },
  { key: "maintenance", label: "Maintenance", unread: 3 },
  { key: "eviction", label: "Eviction & termination", unread: 1 },
  { key: "roommate_disputes", label: "Roommates", unread: 0 },
  { key: "utilities", label: "Utilities", unread: 2 },
];

const courseFeed = [
  {
    id: "p1",
    badge: "Announcement",
    title: "AI lease review pilot rolling out this week",
    snippet: "Upload three sample leases before Friday so we can calibrate the rubric scoring together.",
    meta: "Today · Instructor Lin",
  },
  {
    id: "p2",
    badge: "Q&A spotlight",
    title: "Rent increase notice template shared by Maya",
    snippet: "Includes Massachusetts timeline references plus bilingual language for your tenants.",
    meta: "Yesterday · 46 views",
  },
  {
    id: "p3",
    badge: "Rubric check",
    title: "Class-at-a-glance dashboard updated",
    snippet: "Unread posts dropped 18% after the new folder thresholds—keep an eye on attorney replies.",
    meta: "2 days ago · DataOps bot",
  },
];

const quickActions = [
  { label: "Start AI lease review", description: "Upload PDF or paste contract text", href: "/ai-review" },
  { label: "Post to Q&A board", description: "Share blockers, drafts, or policy questions", href: "/qa/new" },
  { label: "Open admin console", description: "Manage folders & moderate content", href: "/admin" },
];

const stats = [
  { label: "Unread items", value: "151" },
  { label: "Open questions", value: "18" },
  { label: "Attorney replies", value: "32" },
  { label: "AI reviews this week", value: "12" },
];

export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="grid gap-5 lg:grid-cols-[260px_1fr_320px]">
        <div className="space-y-5">
          <article className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-5 shadow-lg shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Class health</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">LeaseQA · Piazza lab</h2>
            <p className="mt-3 text-sm text-slate-400">
              Sprint 02 · AI review integration. Keep unread items below 175 to stay on track for demo week.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-black/10 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">{stat.label}</dt>
                  <dd className="text-xl font-semibold text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-5 shadow-lg shadow-black/20">
            <header className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span>Folders</span>
              <Link href="/qa" className="text-[11px] text-slate-300 hover:text-white">
                View board →
              </Link>
            </header>
            <ul className="mt-4 space-y-2 text-sm">
              {folderFilters.map((folder) => (
                <li
                  key={folder.key}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/10 px-3 py-2"
                >
                  <span className="text-slate-200">{folder.label}</span>
                  <span className="rounded-full bg-[var(--pill-counter)] px-2 py-0.5 text-[11px] text-slate-200">
                    {folder.unread}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-5 shadow-lg shadow-black/20">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Course feed</p>
                <h2 className="text-xl font-semibold text-white">Renters & instructors</h2>
              </div>
              <Link
                href="/qa/new"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-white/10"
              >
                New post
              </Link>
            </header>
            <ul className="mt-6 space-y-4">
              {courseFeed.map((item) => (
                <li key={item.id} className="rounded-2xl border border-white/5 bg-black/5 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--accent-cyan)]">{item.badge}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.snippet}</p>
                  <p className="mt-3 text-xs text-slate-500">{item.meta}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <article className="rounded-2xl border border-white/5 bg-gradient-to-br from-[var(--accent-gradient-from)] via-[var(--accent-gradient-via)] to-[var(--accent-gradient-to)] p-5 shadow-2xl shadow-black/30">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--accent-cyan-soft)]">AI workflow</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Claude-powered lease review</h2>
            <p className="mt-3 text-sm text-slate-200">
              Drag in a PDF or paste the relevant clauses to generate a rubric-aligned risk report.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/ai-review"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-inner shadow-white/10 hover:bg-white/20"
              >
                Launch AI review
              </Link>
              <Link
                href="/qa/new"
                className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
              >
                Ask the class →
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-5 shadow-lg shadow-black/20">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Quick actions</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {quickActions.map((action) => (
                <li key={action.href} className="rounded-xl border border-white/5 bg-black/10 p-3">
                  <p className="font-medium text-slate-200">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                  <Link href={action.href} className="mt-2 inline-flex items-center text-xs text-[var(--accent-cyan)]">
                    Go →
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article
            className="rounded-2xl border border-dashed bg-[var(--accent-gradient-to)] p-5 text-sm text-slate-300 shadow-lg shadow-black/30"
            style={{
              borderColor: "color-mix(in srgb, var(--accent-blue) 30%, transparent)",
            }}
          >
            <h2 className="text-base font-semibold text-white">Rubric alignment checklist</h2>
            <p className="mt-2">
              Double-check the Pazza rubric before demo day. Each card links to the exact acceptance criteria.
            </p>
            <Link
              href="https://github.com/your-org/leaseqa/tree/main/docs/requirements.md"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-cyan)]"
            >
              View docs →
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
