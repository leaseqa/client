"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useFolders } from "../hooks/useFolders";

export default function ScenarioFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeScenario = searchParams.get("scenario") || "all";

  // Shares the page's folder query rather than issuing a second request.
  // `uncategorized` is where a post lands when no topic was chosen — a storage
  // fallback, so it is not offered as something to filter by.
  const folders = useFolders().folders.filter(
    (folder) => folder.name !== "uncategorized",
  );

  const handleSelect = (value: string) => {
    if ( value === "all" ) {
      router.push("/qa");
    } else {
      router.push(`/qa?scenario=${value}`);
    }
  };

  return (
    <div className="scenario-filter">
      <button
        className={`scenario-chip ${activeScenario === "all" ? "active" : ""}`}
        type="button"
        aria-pressed={activeScenario === "all"}
        onClick={() => handleSelect("all")}
      >
        All topics
      </button>
      {folders.map((folder) => (
        <button
          key={folder.name}
          className={`scenario-chip ${activeScenario === folder.name ? "active" : ""}`}
          type="button"
          aria-pressed={activeScenario === folder.name}
          onClick={() => handleSelect(folder.name)}
        >
          {folder.displayName}
        </button>
      ))}
    </div>
  );
}
