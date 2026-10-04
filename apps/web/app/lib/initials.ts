/**
 * Two letters for an avatar: the first and last word of a name ("Demo Tenant"
 * → "DT"), or the first two letters of a single word ("Guest" → "GU").
 * Slicing the whole string gave "DE" for "Demo Tenant".
 */
export function initialsFor(name?: string | null) {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if ( words.length === 0 ) {
    return "?";
  }
  if ( words.length === 1 ) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
