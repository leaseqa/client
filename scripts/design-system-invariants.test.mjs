// Locks the invariants the design-system consolidation established, so a later
// change cannot quietly undo them. These are cheap text assertions on the
// stylesheet, not a substitute for the computed-style guard in
// check-visual-regression.mjs — that one proves a change is inert, this one
// proves the structure it left behind is still intact.

import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CLIENT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const GLOBALS = path.join(CLIENT_DIR, "apps/web/app/globals.css");

const readGlobals = () => readFile(GLOBALS, "utf8");

/** Strip comments so prose in them cannot trip a text assertion. */
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

async function collectCss() {
  const roots = [path.join(CLIENT_DIR, "apps/web/app"), path.join(CLIENT_DIR, "apps/web/components")];
  const files = [];
  const walk = async (dir) => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        await walk(full);
      } else if (entry.name.endsWith(".css")) {
        files.push(full);
      }
    }
  };
  for (const root of roots) await walk(root);
  return files;
}

test("globals.css keeps exactly one canonical token block", async () => {
  const css = stripComments(await readGlobals());
  const rootBlocks = css.match(/:root\s*\{/g) || [];
  assert.equal(
    rootBlocks.length,
    1,
    `expected one :root block, found ${rootBlocks.length}. Merge the new tokens into the canonical block instead of adding another.`,
  );
});

test("the canonical block still defines the warm surface tokens", async () => {
  const css = stripComments(await readGlobals());
  const start = css.indexOf(":root");
  const block = css.slice(start, css.indexOf("}", start));
  for (const token of [
    "--site-bg", "--site-panel", "--site-ink", "--site-muted",
    "--site-border", "--site-border-strong", "--site-accent",
    "--site-accent-strong", "--site-accent-soft", "--site-highlight",
    "--site-radius",
  ]) {
    assert.ok(block.includes(`${token}:`), `${token} is missing from the canonical :root block`);
  }
});

test("no stylesheet animates every property", async () => {
  const offenders = [];
  for (const file of await collectCss()) {
    const css = stripComments(await readFile(file, "utf8"));
    // `transition: all` forces the compositor to watch every animatable
    // property and tends to animate things nobody intended.
    if (/transition\s*:\s*all\b/.test(css) || /transition-property\s*:\s*all\b/.test(css)) {
      offenders.push(path.relative(CLIENT_DIR, file));
    }
  }
  assert.deepEqual(offenders, [], `transition: all found in ${offenders.join(", ")} — name the properties instead`);
});

test("active styles do not reach for the legacy purple aliases", async () => {
  const offenders = [];
  for (const file of await collectCss()) {
    const css = stripComments(await readFile(file, "utf8"));
    for (const legacy of ["--accent-purple", "--gradient-purple"]) {
      // The alias may still be *defined* for back-compat; using it is the problem.
      if (new RegExp(`var\\(\\s*${legacy}\\b`).test(css)) {
        offenders.push(`${path.relative(CLIENT_DIR, file)} uses ${legacy}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `legacy purple aliases in use: ${offenders.join(", ")}. The product has no purple; use --site-accent.`);
});

test("no bare 1fr grid track, which cannot shrink below min-content", async () => {
  const offenders = [];
  for (const file of await collectCss()) {
    const css = stripComments(await readFile(file, "utf8"));
    // `1fr` means `minmax(auto, 1fr)`, and an `auto` minimum refuses to shrink
    // past the item's min-content width — which silently overflowed the
    // compose form on mobile. `minmax(0, 1fr)` is the intended behaviour.
    const matches = css.match(/grid-template-columns\s*:\s*1fr\s*;/g) || [];
    if (matches.length) {
      offenders.push(`${path.relative(CLIENT_DIR, file)} (${matches.length})`);
    }
  }
  assert.deepEqual(offenders, [], `bare "grid-template-columns: 1fr" in ${offenders.join(", ")} — use minmax(0, 1fr)`);
});

test("the stylesheet carries no leftover empty declarations", async () => {
  const css = await readGlobals();
  const bare = (css.match(/\n[ \t]*;[ \t]*(?=\n)/g) || []).length;
  assert.equal(bare, 0, `${bare} empty declarations left behind — a removal dropped the text but kept its semicolon`);
});

test("the body type layer holds only its six steps", async () => {
  // Anything under 16px belongs to the body scale. The heading layer above it
  // is deliberately not constrained yet — see COLOR_GUIDE.md.
  const BODY = new Set(["0.625rem", "0.6875rem", "0.75rem", "0.8125rem", "0.875rem", "0.9375rem"]);
  const offenders = [];
  for (const file of await collectCss()) {
    const css = stripComments(await readFile(file, "utf8"));
    for (const match of css.matchAll(/font-size\s*:\s*([^;}]+)/g)) {
      const value = match[1].trim();
      if (value.includes("!important") || /^(var|calc|clamp)\(/.test(value)) continue;
      const rem = /^([\d.]+)rem$/.exec(value);
      const px = /^([\d.]+)px$/.exec(value);
      const size = rem ? Number(rem[1]) * 16 : px ? Number(px[1]) : null;
      if (size === null || size >= 16) continue;
      if (!BODY.has(value)) {
        offenders.push(`${path.relative(CLIENT_DIR, file)}: ${value} (${size}px)`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `off-scale body sizes: ${offenders.join(", ")}. Use one of ${[...BODY].join(", ")}.`,
  );
});

test("the heading layer holds only its five steps", async () => {
  // 16px and up. The exclusions are not headings: they use font-size to size a
  // glyph or a display figure, so a type scale does not apply to them.
  const HEADING = new Set(["1rem", "1.125rem", "1.25rem", "1.5rem", "2rem"]);
  const NOT_TYPE = [
    "account-avatar", "avatar-circle", "team-avatar", "emoji-icon-lg",
    "sidenav-icon", "site-wordmark", "primaryAction",
    "admin-v2-card-value", "stat-box-value", "landing-stat-val",
    "review-summary-count",
  ];
  const offenders = [];
  for (const file of await collectCss()) {
    const css = stripComments(await readFile(file, "utf8"));
    // Crude rule split is enough: we only need the selector text preceding each
    // font-size, and these stylesheets do not nest style rules.
    for (const block of css.split("}")) {
      const brace = block.lastIndexOf("{");
      if (brace === -1) continue;
      const selector = block.slice(0, brace).split(/[{;]/).pop().trim();
      const match = /font-size\s*:\s*([^;}]+)/.exec(block.slice(brace));
      if (!match) continue;
      const value = match[1].trim();
      if (value.includes("!important") || /^(var|calc|clamp)\(/.test(value)) continue;
      const rem = /^([\d.]+)rem$/.exec(value);
      const px = /^([\d.]+)px$/.exec(value);
      const size = rem ? Number(rem[1]) * 16 : px ? Number(px[1]) : null;
      if (size === null || size < 16) continue;
      if (NOT_TYPE.some((n) => selector.includes(n))) continue;
      if (!HEADING.has(value)) {
        offenders.push(`${path.relative(CLIENT_DIR, file)}: ${selector} ${value}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `off-scale heading sizes: ${offenders.join(", ")}. Use one of ${[...HEADING].join(", ")}.`,
  );
});
