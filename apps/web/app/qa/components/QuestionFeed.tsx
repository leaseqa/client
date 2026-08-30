import { useRouter } from "next/navigation";
import { Folder, Post } from "../types";
import { getFolderDisplayName } from "../utils";
import { Check, MessagesSquare } from "lucide-react";

type QuestionFeedProps = {
  posts: Post[];
  folders: Folder[];
};

/**
 * The main column of the community page: everything matching the current
 * filters that the Pinned and Updates sections above have not already shown.
 *
 * This used to be `FeedHeader`, which took the five most-viewed posts without
 * excluding the pinned and announcement ones — so a pinned post was listed
 * twice on the same screen, and past five posts the rest of the board was
 * unreachable from the main column.
 */
export default function QuestionFeed({ folders, posts }: QuestionFeedProps) {
  const router = useRouter();

  const feedPosts = posts
    .filter((post) => !post.isPinned && post.postType !== "announcement")
    .sort((a, b) => {
      const da = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const db = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return db - da;
    });

  if ( !feedPosts.length ) return null;

  const handlePostClick = (postId: string) => {
    router.push(`/qa?post=${postId}`);
  };

  return (
    <div className="feed-section">
      <div className="feed-section-title">
        <MessagesSquare size={16}/>
        <span>Questions</span>
      </div>
      <div className="feed-section-posts">
        {feedPosts.map((post) => (
          <div
            key={post._id}
            className={`feed-section-post ${post.isResolved ? "resolved" : ""}`}
            onClick={() => handlePostClick(post._id)}
          >
            <div className="feed-section-post-top">
                            <span className="feed-section-post-title">
                                {post.isResolved && (
                                  <span className="resolved-badge d-inline-flex align-items-center">
                                        <Check size={12}/>
                                    </span>
                                )}
                              {post.summary}
                            </span>
              <div className="feed-section-post-tags">
                {post.folders.map(f => (
                  <span key={f} className="feed-section-folder-badge">
                                        {getFolderDisplayName(folders, f)}
                                    </span>
                ))}
                {/* Only `high` says anything. A badge on every row is weight
                    without signal, so the other levels stay unlabelled. */}
                {post.urgency === "high" && (
                  <span className={`feed-section-urgency-badge ${post.urgency}`}>
                                        {post.urgency.toUpperCase()}
                                    </span>
                )}
              </div>
            </div>
            <div className="feed-section-post-snippet">
              {post.details.replace(/<[^>]*>/g, "").slice(0, 120)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
