import { readFileSync } from "node:fs";

const filePath =
  "/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client-frontend/apps/web/app/page.tsx";
const source = readFileSync(filePath, "utf8");

const hasPreviewRows = source.includes("landing-preview-item");
const hasPreviewStatus = source.includes("landing-preview-status");
const stillHasRankMarkup = source.includes("landing-hot-num");
const stillHasViewsMarkup = source.includes("landing-hot-views");

console.log(
  JSON.stringify(
    {
      hasPreviewRows,
      hasPreviewStatus,
      stillHasRankMarkup,
      stillHasViewsMarkup,
    },
    null,
    2,
  ),
);

if (!hasPreviewRows || !hasPreviewStatus || stillHasRankMarkup || stillHasViewsMarkup) {
  throw new Error("Homepage hero still uses the old hot-post list structure.");
}
