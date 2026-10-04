import { Folder, Post } from "../types";
import FeedSection from "./FeedSection";

type AnnouncementProps = {
  posts: Post[];
  folders: Folder[];
};

export default function AnnouncementSection({ posts, folders }: AnnouncementProps) {
  // A pinned announcement is already listed under Pinned directly above.
  const announcementPosts = posts
    .filter((post) => post.postType === "announcement" && !post.isPinned)
    .slice(0, 5);

  return <FeedSection title="Updates" posts={announcementPosts} folders={folders}/>;
}
