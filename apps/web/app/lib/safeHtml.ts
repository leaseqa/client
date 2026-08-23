import { addHook, sanitize } from "isomorphic-dompurify";

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

let hookInstalled = false;

// `rel` has to stay in the allowlist so authors keep legitimate values, but that
// also lets submitted HTML set `rel="opener"` on a `target="_blank"` link and
// hand the opened page a live `window.opener` back into the app. Browsers imply
// noopener for _blank now, and an explicit "opener" defeats that, so rewrite it.
function installRelHook() {
  if ( hookInstalled ) {
    return;
  }
  addHook("afterSanitizeAttributes", (node) => {
    // `instanceof Element` is not usable here: server-side this runs against
    // isomorphic-dompurify's jsdom, where `Element` is not a global.
    const element = node as unknown as {
      tagName?: string;
      getAttribute?: (name: string) => string | null;
      setAttribute?: (name: string, value: string) => void;
    };
    if ( element.tagName !== "A" || !element.getAttribute || !element.setAttribute ) {
      return;
    }
    if ( element.getAttribute("target") ) {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  });
  hookInstalled = true;
}

export function sanitizeServerHtml(html: string): string {
  if ( !html ) {
    return "";
  }
  installRelHook();
  return sanitize(html, SANITIZE_CONFIG);
}
