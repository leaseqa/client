import { Folder, Post } from "./types";

export const getFolderDisplayName = (folders: Folder[], folderName: string) => {
  const folder = folders.find(f => f.name === folderName);
  return folder?.displayName || folderName;
};

export const getPostCount = (posts: Post[], folderName: string) => {
  return posts.filter(post => post.folders.includes(folderName)).length;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
  "&nbsp;": " ",
};

/**
 * Post bodies are stored as editor HTML. Previews show them as one line of
 * plain text and let CSS clamp the length, so nothing here appends an
 * ellipsis — the old `slice(0, 120) + "..."` added one even to short posts.
 */
export const toPlainText = (html: string) =>
  html
    // A block boundary separates words; an inline tag (<strong>) must not, or
    // "<strong>Monday</strong>." would read "Monday .".
    .replace(/<\/(?:p|div|li|h[1-6]|blockquote|pre)>|<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();

/** "1 answer", "2 answers" — the count chips used to read "1 discussions". */
export const countLabel = (count: number, singular: string) =>
  `${count} ${singular}${count === 1 ? "" : "s"}`;
