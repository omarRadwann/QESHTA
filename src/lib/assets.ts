import { siteConfig } from "@/lib/site";

const githubPagesBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.GITHUB_PAGES === "true" ? "/QESHTA" : "");

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function assetPath(path: string) {
  return `${githubPagesBasePath}${normalizePath(path)}`;
}

export function siteAssetUrl(path: string) {
  return `${siteConfig.siteUrl}${normalizePath(path)}`;
}
