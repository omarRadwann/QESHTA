const githubPagesBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.GITHUB_PAGES === "true" ? "/QESHTA" : "");

export function assetPath(path: string) {
  return `${githubPagesBasePath}${path}`;
}
