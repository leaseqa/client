import Link from "next/link";
import { format } from "date-fns";
import { useMemo } from "react";
import { Post, RecencySidebarProps } from "../types";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function RecencySidebar({
                                         posts,
                                         currentPostId,
                                         folderDisplayMap = {},
                                         bucketOpen,
                                         onToggleBucket,
                                       }: RecencySidebarProps) {
  const grouped = useMemo(() => {
    const now = new Date();
    const buckets: Record<string, { label: string; items: Post[] }> = {
      thisWeek: { label: "This week", items: [] },
      lastWeek: { label: "Last week", items: [] },
      thisMonth: { label: "Earlier this month", items: [] },
      earlier: { label: "Earlier", items: [] },
    };

    const sorted = [...posts].sort((a, b) => {
      const da = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const db = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return db - da;
    });

    sorted.forEach((p) => {
      const created = new Date(p.createdAt || 0);
      const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      if ( diffDays <= 6 ) buckets.thisWeek.items.push(p);
      else if ( diffDays <= 13 ) buckets.lastWeek.items.push(p);
      else if ( diffDays <= 30 ) buckets.thisMonth.items.push(p);
      else buckets.earlier.items.push(p);
    });

    return buckets;
  }, [posts]);

  const hasAny = Object.values(grouped).some((b) => b.items.length);
  if ( !hasAny ) return null;

  const getAuthor = (p: Post) => p.isAnonymous ? "Anonymous" : (p.author?.username || p.author?.email || "Unknown");
  const getFolder = (p: Post) => {
    const key = p.folders?.[0];
    return key ? folderDisplayMap[key] || key : "";
  };

  return (
    <div className="post-sidebar">
      {Object.entries(grouped).map(([key, bucket]) => {
        if ( !bucket.items.length ) return null;
        const isOpen = bucketOpen[key] ?? true;
        return (
          <section className="post-sidebar-group" key={key}>
            <button
              type="button"
              className="post-sidebar-header"
              aria-expanded={isOpen}
              onClick={() => onToggleBucket(key)}
            >
              {isOpen ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
              <span>{bucket.label}</span>
              <span className="post-sidebar-count">{bucket.items.length}</span>
            </button>
            {isOpen && (
              <ul className="post-sidebar-items">
                {bucket.items.map((p) => {
                  const isActive = p._id === currentPostId;
                  const folder = getFolder(p);
                  return (
                    <li key={p._id}>
                      {/* A link, not a clickable div, so the list is reachable
                          by keyboard and each thread can open in a new tab. */}
                      <Link
                        href={`/qa?post=${p._id}`}
                        className={`post-sidebar-item${isActive ? " active" : ""}${p.isResolved ? " resolved" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="post-sidebar-item-date">
                          {p.createdAt ? format(new Date(p.createdAt), "MMM d") : ""}
                        </span>
                        <span className="post-sidebar-item-title">{p.summary}</span>
                        <span className="post-sidebar-item-meta">
                          {[p.isResolved ? "Resolved" : "", folder, getAuthor(p)]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
