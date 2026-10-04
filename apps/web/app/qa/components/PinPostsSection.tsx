import { Folder, Post } from "../types";
import FeedSection from "./FeedSection";

type PinPostsProps = {
  posts: Post[];
  folders: Folder[];
};

export default function PinPostsSection({ posts, folders }: PinPostsProps) {
  const pinPosts = posts.filter((post) => post.isPinned).slice(0, 5);

  return <FeedSection title="Pinned" posts={pinPosts} folders={folders}/>;
}
