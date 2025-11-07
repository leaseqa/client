"use client";

import { useState } from "react";

type ReviewState =
  | { status: "idle" }
  | { status: "uploading" }
  | {
      status: "success";
      summary: string;
      highRisk: string[];
      mediumRisk: string[];
      lowRisk: string[];
    }
  | { status: "error"; message: string };

export default function AIReviewPage() {
  const [state, setState] = useState<ReviewState>({ status: "idle" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ status: "uploading" });
    // TODO: wire up the real API once backend is ready
    await new Promise((resolve) => setTimeout(resolve, 1600));
    setState({
      status: "success",
      summary: "Overall the lease follows Boston residential standards. Review the flagged clauses below.",
      highRisk: [
        "Clause 12: Early termination fee exceeds the Massachusetts statutory cap.",
        "Clause 18: Tenant responsible for all repairs with no reasonable exceptions.",
      ],
      mediumRisk: ["Clause 6: Security-deposit return timeline is vague—add a concrete date."],
      lowRisk: ["Clause 3: Installment schedule looks reasonable."],
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workflow</p>
        <h1 className="text-3xl font-semibold text-white">AI lease review</h1>
        <p className="text-sm text-slate-400">
          Upload a PDF or paste text and Claude will return a graded risk report in ~30–60 seconds.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-dashed bg-[var(--app-panel)] p-6 shadow-2xl shadow-black/30"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-blue) 40%, transparent)",
        }}
      >
        <label
          htmlFor="file"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-100 hover:border-white/20"
        >
          <span className="font-medium text-white">Drag & drop or click to upload a PDF</span>
          <span className="text-xs text-slate-400">Up to 10 MB</span>
        </label>
        <input id="file" name="file" type="file" accept="application/pdf" hidden />

        <div className="mt-4">
          <label className="text-sm font-medium text-white">
            Or paste the lease text
          </label>
          <textarea
            className="mt-2 h-40 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-slate-500 focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-blue)] focus:ring-opacity-40"
            placeholder="Paste the clauses you want Claude to review…"
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            By uploading you confirm the lease is only processed for risk analysis and not stored long term.
          </span>
          <button
            type="submit"
            className="inline-flex items-center rounded-xl bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-[var(--accent-blue-hover)] disabled:cursor-not-allowed disabled:bg-[var(--accent-blue-muted)]"
            disabled={state.status === "uploading"}
          >
            {state.status === "uploading" ? "Analyzing…" : "Start review"}
          </button>
        </div>
      </form>

      {state.status === "success" && (
        <section className="mt-10 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-6 shadow-lg shadow-black/30">
            <h2 className="text-lg font-semibold text-white">Summary</h2>
            <p className="mt-2 text-sm text-slate-300">{state.summary}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <RiskCard tone="danger" title="High risk" items={state.highRisk} />
            <RiskCard tone="warning" title="Medium risk" items={state.mediumRisk} />
            <RiskCard tone="success" title="Standard clauses" items={state.lowRisk} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">
              Download report
            </button>
            <button className="rounded-xl bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-blue-hover)]">
              Still unsure? Ask the community →
            </button>
          </div>
        </section>
      )}

      {state.status === "error" && (
        <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      )}
    </div>
  );
}

type RiskCardProps = {
  tone: "danger" | "warning" | "success";
  title: string;
  items: string[];
};

function RiskCard({ tone, title, items }: RiskCardProps) {
  const toneClass =
    tone === "danger"
      ? "border-red-500/40 bg-red-500/10 text-red-100"
      : tone === "warning"
        ? "border-amber-400/40 bg-amber-500/10 text-amber-50"
        : "border-emerald-300/40 bg-emerald-500/10 text-emerald-50";

  return (
    <article className={`rounded-2xl border p-4 text-sm shadow-lg shadow-black/20 ${toneClass}`}>
      <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
      <ul className="space-y-2 text-slate-100">
        {items.map((item) => (
          <li key={item} className="leading-relaxed">
            • {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
