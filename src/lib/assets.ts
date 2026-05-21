import { siteConfig } from "@/lib/site";

const githubPagesBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.GITHUB_PAGES === "true" ? "/QESHTA" : "");

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function isRemoteAsset(path: string) {
  return /^(https?:|data:|blob:)/.test(path);
}

export function assetPath(path: string) {
  if (isRemoteAsset(path)) return path;

  return `${githubPagesBasePath}${normalizePath(path)}`;
}

export function siteAssetUrl(path: string) {
  if (isRemoteAsset(path)) return path;

  return `${siteConfig.siteUrl}${normalizePath(path)}`;
}
