const githubPagesBasePath = process.env.GITHUB_PAGES === "true" ? "/QESHTA" : "";

export function assetPath(path: string) {
  return `${githubPagesBasePath}${path}`;
}
