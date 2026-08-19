import { sanitize } from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "span",
  "div",
  "pre",
  "code",
  "hr",
  "img",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "class",
  "src",
  "alt",
  "title",
  "width",
  "height",
];

const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

export function sanitizeServerHtml(html: string): string {
  if ( !html ) {
    return "";
  }
  return sanitize(html, SANITIZE_CONFIG);
}
