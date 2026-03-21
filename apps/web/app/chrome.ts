export const shouldHideGlobalChrome = (pathname: string | null | undefined) =>
  String(pathname || "").startsWith("/study/");
