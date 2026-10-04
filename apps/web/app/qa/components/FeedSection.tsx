import Link from "next/link";
import { format } from "date-fns";
import { Check } from "lucide-react";

import { Folder, Post } from "../types";
import { getFolderDisplayName, toPlainText } from "../utils";

type FeedSectionProps = {
  title: string;
  posts: Post[];
  folders: Folder[];
};

/**
 * One titled run of community posts. Pinned, Updates and Questions are three
 * filters over the same row, so the row is written once, here.
 *
 * Each row is a link: the rows used to be `div`s with click handlers, which a
 * keyboard could not reach and a middle click could not open.
 */
export default function FeedSection({ title, posts, folders }: FeedSectionProps) {
  if ( !posts.length ) return null;

  const headingId = `feed-section-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="feed-section" aria-labelledby={headingId}>
      <h2 id={headingId} className="feed-section-title">
        <span>{title}</span>
        <span className="feed-section-count">{posts.length}</span>
      </h2>
      <ul className="feed-section-posts">
        {posts.map((post) => (
          <li key={post._id}>
            <Link
              href={`/qa?post=${post._id}`}
              className={`feed-section-post${post.isResolved ? " resolved" : ""}`}
            >
              <span className="feed-section-post-title">{post.summary}</span>
              <span className="feed-section-post-snippet">
                {toPlainText(post.details)}
              </span>
              <span className="feed-section-post-tags">
                {post.createdAt ? (
                  <time dateTime={post.createdAt}>
                    {format(new Date(post.createdAt), "MMM d")}
                  </time>
                ) : null}
                {/* Only `high` says anything. A badge on every row is weight
                    without signal, so the other levels stay unlabelled. */}
                {post.urgency === "high" && (
                  <span className="feed-section-urgency-badge high">Urgent</span>
                )}
                {post.isResolved && (
                  <span className="feed-section-resolved">
                    <Check size={12} aria-hidden="true"/>
                    Resolved
                  </span>
                )}
                {post.folders.map((folder) => (
                  <span key={folder} className="feed-section-folder-badge">
                    {getFolderDisplayName(folders, folder)}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
