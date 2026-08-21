export function resolveSafeNextHref(
  nextHref: string | string[] | undefined,
): string | null {
  return typeof nextHref === "string" && nextHref.startsWith("/")
    ? nextHref
    : null;
}
