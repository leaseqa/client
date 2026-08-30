"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Plus, Search } from "lucide-react";

type QAToolbarProps = {
  initialSearch?: string;
  onSearchChangeAction?: (value: string) => void;
  showResolved: boolean;
  onToggleResolvedAction: () => void;
};

export default function QAToolbar({
                                    initialSearch = "",
                                    onSearchChangeAction,
                                    showResolved,
                                    onToggleResolvedAction,
                                  }: QAToolbarProps) {
  const router = useRouter();
  const session = useSelector((state: RootState) => state.session);
  const isGuest = session.status === "guest";
  const [search, setSearch] = useState(initialSearch);

  const handleChange = (value: string) => {
    setSearch(value);
    onSearchChangeAction?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ( e.key === "Enter" && search.trim() ) {
      router.push(`/qa?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="qa-toolbar">
      <div className="qa-toolbar-search-group">
        <label className="qa-toolbar-search-label" htmlFor="qa-community-search">
          Search community questions
        </label>
        <div className="qa-toolbar-search">
          <Search size={14} className="qa-toolbar-search-icon"/>
          <input
            id="qa-community-search"
            type="text"
            placeholder="Search by lease issue or topic"
            value={search}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <div className="qa-status-filter" aria-label="Question status">
        <button
          className={`qa-toolbar-btn ${showResolved ? "secondary" : "active"}`}
          type="button"
          aria-pressed={!showResolved}
          onClick={() => showResolved && onToggleResolvedAction()}
        >
          <span>Open</span>
        </button>
        <button
          className={`qa-toolbar-btn ${showResolved ? "active" : "secondary"}`}
          type="button"
          aria-pressed={showResolved}
          onClick={() => !showResolved && onToggleResolvedAction()}
        >
          <span>Resolved</span>
        </button>
      </div>
      {!isGuest && (
        <button
          className="qa-toolbar-btn primary"
          type="button"
          onClick={() => router.push("/qa?compose=1")}
        >
          <Plus size={12}/>
          <span>Ask</span>
        </button>
      )}
    </div>
  );
}
