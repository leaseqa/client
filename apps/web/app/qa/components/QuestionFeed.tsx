import { Folder, Post } from "../types";
import FeedSection from "./FeedSection";

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
  const feedPosts = posts
    .filter((post) => !post.isPinned && post.postType !== "announcement")
    .sort((a, b) => {
      const da = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const db = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return db - da;
    });

  return <FeedSection title="Questions" posts={feedPosts} folders={folders}/>;
}
