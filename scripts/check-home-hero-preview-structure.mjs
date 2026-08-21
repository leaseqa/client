import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageSource = readFileSync(
  path.join(root, "apps/web/app/page.tsx"),
  "utf8",
);
const journeySource = readFileSync(
  path.join(root, "apps/web/app/home/HomeJourney.tsx"),
  "utf8",
);

const usesHomeJourney = pageSource.includes('from "./home/HomeJourney"');
const hasStablePreview = journeySource.includes(
  'aria-label="Example lease guidance comparison"',
);
const hasVerificationQuestion = journeySource.includes("Question to verify");
const stillUsesHotPosts = pageSource.includes("fetchPosts");

console.log(
  JSON.stringify(
    {
      usesHomeJourney,
      hasStablePreview,
      hasVerificationQuestion,
      stillUsesHotPosts,
    },
    null,
    2,
  ),
);

if (
  !usesHomeJourney ||
  !hasStablePreview ||
  !hasVerificationQuestion ||
  stillUsesHotPosts
) {
  throw new Error(
    "Homepage hero does not use the stable guidance preview structure.",
  );
}
