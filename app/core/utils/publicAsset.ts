const PORTFOLIO_SCOPE = "/Portfolio";

export function resolvePublicAssetHref(assetPath: string): string {
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;

  if (typeof window === "undefined") {
    return normalizedPath;
  }

  const currentPath = window.location.pathname;
  const scopePrefix =
    currentPath === PORTFOLIO_SCOPE || currentPath.startsWith(`${PORTFOLIO_SCOPE}/`)
      ? PORTFOLIO_SCOPE
      : "";

  return `${scopePrefix}${normalizedPath}`;
}