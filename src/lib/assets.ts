import { siteConfig } from "@/lib/site";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function isRemoteAsset(path: string) {
  return /^(https?:|data:|blob:)/.test(path);
}

export function assetPath(path: string) {
  if (isRemoteAsset(path)) return path;

  return `${basePath}${normalizePath(path)}`;
}

export function siteAssetUrl(path: string) {
  if (isRemoteAsset(path)) return path;

  return `${siteConfig.siteUrl}${normalizePath(path)}`;
}
