// Style-level regression guard for CSS consolidation work.
//
// `globals.css` stacks rules from several redesigns, so the same selector is
// often declared more than once and the winning declaration is not always the
// last one. Before removing a duplicate you need to know whether anything
// actually rendered differently. This captures a fingerprint of every
// element's computed style across the public routes, so two runs can be
// compared as text.
//
// Computed styles are used rather than screenshots on purpose: pixel diffs
// report antialiasing noise on every font rerender, while a computed-style
// diff names the element and the property that moved.
//
// Usage:
//   node scripts/check-visual-regression.mjs --out before.json
//   ...make the CSS change...
//   node scripts/check-visual-regression.mjs --out after.json
//   node scripts/check-visual-regression.mjs --compare before.json after.json
//
// The dev server must already be running. Point at it with LEASEQA_PREVIEW_URL.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const clientDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { chromium } = await import(
  path.join(clientDir, "node_modules/playwright/index.mjs")
);

const PREVIEW = process.env.LEASEQA_PREVIEW_URL || "http://127.0.0.1:3000";

const ROUTES = [
  "/",
  "/ai-review",
  "/qa",
  // The composer, a post detail view and the admin workspace carry a large
  // share of the stylesheet (.compose-form-*, .post-*, .qa-manage-*). Without
  // them a consolidation pass can report "inert" while having changed them.
  "/qa?compose=1",
  "/qa?post=post-1",
  "/qa/manage",
  "/qa/resources",
  "/qa/stats",
  "/account",
  "/auth/login",
  "/auth/register",
  "/info",
];

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "tablet", width: 900, height: 1200 },
  { name: "mobile", width: 390, height: 900 },
];

// Properties worth watching for a layout/skin refactor. Deliberately excludes
// things that legitimately vary between runs, such as scroll offsets.
const PROPS = [
  "display", "position", "box-sizing", "overflow", "z-index", "opacity",
  "color", "background-color", "background-image",
  "border-top-width", "border-right-width", "border-bottom-width",
  "border-left-width", "border-top-color", "border-top-style",
  "border-top-left-radius", "border-bottom-right-radius",
  "box-shadow",
  "font-family", "font-size", "font-weight", "font-style",
  "line-height", "letter-spacing", "text-transform", "text-align",
  "text-decoration-line", "white-space",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "flex-direction", "flex-wrap", "justify-content", "align-items",
  "gap", "grid-template-columns", "grid-column", "min-height", "max-width",
];

// Enough shape for each route to render populated rather than empty, so the
// fingerprint covers the list and card styles that the duplicate selectors
// actually target. Matched against the request URL by substring, first hit wins.
const FIXTURES = {
  "/auth/session": {
    data: {
      _id: "user-1",
      username: "Regression Fixture",
      email: "fixture@leaseqa.dev",
      role: "admin",
    },
  },
  "/folders": {
    data: [
      {
        _id: "folder-1", name: "deposits", displayName: "Deposits",
        description: "Security deposit questions", color: "#5c6e4e",
      },
      {
        _id: "folder-2", name: "repairs", displayName: "Repairs",
        description: "Maintenance and habitability", color: "#c4704b",
      },
    ],
  },
  "/stats/overview": {
    data: {
      totalPosts: 42, totalAnswers: 87, totalUsers: 19, resolvedPosts: 27,
    },
  },
  "/posts": {
    data: [
      {
        _id: "post-1",
        summary: "How long does a landlord have to return a deposit?",
        details: "<p>My lease ended last month.</p>",
        postType: "question", folders: ["folder-1"], authorId: "user-2",
        lawyerOnly: false, fromAIReviewId: null, urgency: "medium",
        viewCount: 12, isPinned: true, isResolved: false, isAnonymous: false,
        createdAt: "2026-08-18T10:00:00.000Z",
        updatedAt: "2026-08-18T10:00:00.000Z",
        lastActivityAt: "2026-08-20T10:00:00.000Z",
        author: { _id: "user-2", username: "Renter One", role: "tenant" },
        answers: [], discussions: [],
      },
      {
        _id: "post-2",
        summary: "Is a two month deposit allowed?",
        details: "<p>The lease asks for two months up front.</p>",
        postType: "question", folders: ["folder-1"], authorId: "user-3",
        lawyerOnly: false, fromAIReviewId: null, urgency: "high",
        viewCount: 30, isPinned: false, isResolved: true, isAnonymous: true,
        createdAt: "2026-08-12T10:00:00.000Z",
        updatedAt: "2026-08-12T10:00:00.000Z",
        lastActivityAt: "2026-08-19T10:00:00.000Z",
        author: null, answers: [], discussions: [],
      },
    ],
  },
  "/activity": {
    data: [
      {
        _id: "act-1", type: "answer", title: "New answer on your question",
        summary: "Security deposit deadline question", href: "/qa?post=post-1",
        surface: "both", createdAt: "2026-08-20T15:00:00.000Z",
      },
    ],
  },
};

function parseArgs(argv) {
  const args = { out: null, compare: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--out") {
      args.out = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--compare") {
      args.compare = [argv[i + 1], argv[i + 2]];
      i += 2;
    }
  }
  return args;
}

async function capture(outPath) {
  const browser = await chromium.launch();
  const result = { preview: PREVIEW, capturedAt: new Date().toISOString(), pages: {} };
  const redirects = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    // The paired backend is not required for a style fingerprint, and stubbing
    // it keeps every run identical. A session has to be stubbed too: /qa,
    // /ai-review and /account redirect to the login page when signed out, so
    // without this the harness silently fingerprints login three times.
    await context.route("**/api/**", (route) => {
      const url = route.request().url();
      const json = (body) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(body),
        });
      for (const [pattern, body] of Object.entries(FIXTURES)) {
        if (url.includes(pattern)) return json(body);
      }
      return json({ data: [] });
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      // A dev server compiles each route on first request, so the first visit
      // can settle long after load. Visit once to warm it, then measure.
      await page.goto(`${PREVIEW}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.goto(`${PREVIEW}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      // Client routes swap out of their loading state after the stubbed
      // fetches resolve; wait for that rather than a fixed delay.
      await page
        .waitForFunction(() => !document.querySelector(".page-loading-state"), null, {
          timeout: 8000,
        })
        .catch(() => {});
      await page.waitForTimeout(500);
      const fingerprint = await page.evaluate((props) => {
        const out = {};
        const seen = new Map();
        const keyFor = (el) => {
          const parts = [];
          let node = el;
          while (node && node !== document.documentElement) {
            const parent = node.parentElement;
            const index = parent
              ? Array.prototype.indexOf.call(parent.children, node) + 1
              : 1;
            parts.unshift(`${node.tagName.toLowerCase()}:${index}`);
            node = parent;
          }
          let key = parts.join(">");
          // Guard against the same path appearing twice, which should not
          // happen but would silently drop an element if it did.
          if (seen.has(key)) {
            const n = seen.get(key) + 1;
            seen.set(key, n);
            key = `${key}#${n}`;
          } else {
            seen.set(key, 1);
          }
          return key;
        };

        document.querySelectorAll("*").forEach((el) => {
          const tag = el.tagName.toLowerCase();
          if (tag === "script" || tag === "style" || tag === "link" || tag === "meta") {
            return;
          }
          // Next.js dev overlay is injected only in development.
          if (el.closest("nextjs-portal")) return;

          const cs = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          const entry = {
            cls: el.getAttribute("class") || "",
            box: [
              Math.round(rect.width * 100) / 100,
              Math.round(rect.height * 100) / 100,
            ],
          };
          props.forEach((p) => {
            entry[p] = cs.getPropertyValue(p);
          });
          out[keyFor(el)] = entry;
        });
        return out;
      }, PROPS);

      const landed = new URL(page.url()).pathname;
      const redirected = landed !== route.split("?")[0];
      result.pages[`${vp.name}${route}`] = fingerprint;
      const count = Object.keys(fingerprint).length;
      console.log(
        `captured ${vp.name.padEnd(7)} ${route.padEnd(16)} ${String(count).padStart(4)} elements` +
        (redirected ? `  !! redirected to ${landed}` : ""),
      );
      if (redirected) redirects.push(`${vp.name}${route} -> ${landed}`);
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(outPath, JSON.stringify(result, null, 1));
  const total = Object.values(result.pages).reduce(
    (sum, page) => sum + Object.keys(page).length,
    0,
  );
  console.log(`\nwrote ${outPath} — ${Object.keys(result.pages).length} page/viewport pairs, ${total} elements`);
  if (redirects.length) {
    console.log(
      `\n${redirects.length} route(s) redirected, so the fingerprint is of the ` +
      "destination rather than the route asked for:",
    );
    redirects.forEach((r) => console.log("  " + r));
  }
}

function compare(beforePath, afterPath) {
  const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
  const after = JSON.parse(fs.readFileSync(afterPath, "utf8"));
  const findings = [];

  const pageKeys = new Set([
    ...Object.keys(before.pages),
    ...Object.keys(after.pages),
  ]);

  for (const pageKey of [...pageKeys].sort()) {
    const b = before.pages[pageKey];
    const a = after.pages[pageKey];
    if (!b) {
      findings.push(`${pageKey}: only present after`);
      continue;
    }
    if (!a) {
      findings.push(`${pageKey}: only present before`);
      continue;
    }
    const elKeys = new Set([...Object.keys(b), ...Object.keys(a)]);
    for (const el of elKeys) {
      if (!b[el]) {
        findings.push(`${pageKey} ${el} [${a[el].cls}]: element added`);
        continue;
      }
      if (!a[el]) {
        findings.push(`${pageKey} ${el} [${b[el].cls}]: element removed`);
        continue;
      }
      for (const prop of Object.keys(b[el])) {
        const bv = JSON.stringify(b[el][prop]);
        const av = JSON.stringify(a[el][prop]);
        if (bv !== av) {
          findings.push(
            `${pageKey} ${el} [${b[el].cls || "-"}] ${prop}: ${bv} -> ${av}`,
          );
        }
      }
    }
  }

  if (findings.length === 0) {
    console.log("No computed-style differences. The change is visually inert.");
    return 0;
  }
  console.log(`${findings.length} computed-style difference(s):\n`);
  findings.slice(0, 400).forEach((f) => console.log("  " + f));
  if (findings.length > 400) {
    console.log(`  ... and ${findings.length - 400} more`);
  }
  return 1;
}

const args = parseArgs(process.argv.slice(2));

if (args.compare) {
  process.exit(compare(args.compare[0], args.compare[1]));
} else if (args.out) {
  await capture(args.out);
} else {
  console.error(
    "Usage:\n" +
    "  node scripts/check-visual-regression.mjs --out <file.json>\n" +
    "  node scripts/check-visual-regression.mjs --compare <before.json> <after.json>",
  );
  process.exit(2);
}
