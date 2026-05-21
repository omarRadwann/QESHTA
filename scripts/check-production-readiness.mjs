import { existsSync, readFileSync } from "node:fs";

loadLocalEnv();

const checks = [];

await checkEnvironment();
await checkSupabaseAuth();
await checkPublicCatalog();
await checkWishlistProtection();

const failedChecks = checks.filter((check) => check.status === "fail");

for (const check of checks) {
  const marker = check.status === "pass" ? "PASS" : "FAIL";
  console.log(`${marker} ${check.label}`);
  if (check.detail) console.log(`     ${check.detail}`);
}

if (failedChecks.length > 0) {
  process.exitCode = 1;
}

async function checkEnvironment() {
  addCheck("NEXT_PUBLIC_SITE_URL is configured", Boolean(process.env.NEXT_PUBLIC_SITE_URL));
  addCheck("NEXT_PUBLIC_SUPABASE_URL is configured", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));
  addCheck(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is configured",
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}

async function checkSupabaseAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return;

  try {
    const settings = await fetchJson(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
    });

    addCheck(
      "Supabase email auth is enabled",
      settings.external?.email === true,
      "Customers need at least one working sign-in method.",
    );
    addCheck(
      "Supabase Google OAuth is enabled",
      settings.external?.google === true,
      "Enable Google in Supabase Auth Providers with the Google client ID and secret.",
    );
  } catch (error) {
    addCheck(
      "Supabase auth settings are reachable",
      false,
      error instanceof Error ? error.message : "Unknown auth settings error.",
    );
  }
}

async function checkPublicCatalog() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return;

  try {
    const rows = await fetchJson(
      `${url}/rest/v1/catalog_products?select=product_id,price,status&status=eq.active&limit=20`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );

    addCheck(
      "Public active catalog is readable",
      Array.isArray(rows) && rows.length > 0,
      Array.isArray(rows) ? `${rows.length} active rows visible.` : "Unexpected catalog response.",
    );
  } catch (error) {
    addCheck(
      "Public active catalog is readable",
      false,
      error instanceof Error ? error.message : "Unknown catalog error.",
    );
  }
}

async function checkWishlistProtection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return;

  try {
    const response = await fetch(
      `${url}/rest/v1/wishlist_items?select=product_id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      addCheck(
        "Wishlist data is protected from anonymous access",
        true,
        `${response.status} ${response.statusText}`,
      );
      return;
    }

    const rows = response.ok ? await response.json() : null;
    const exposesNoRows = Array.isArray(rows) && rows.length === 0;

    addCheck(
      "Wishlist data is protected from anonymous access",
      exposesNoRows,
      exposesNoRows
        ? "No wishlist rows are visible to anonymous visitors."
        : response.ok
          ? "Anonymous visitors can read wishlist rows."
          : `${response.status} ${response.statusText}`,
    );
  } catch (error) {
    addCheck(
      "Wishlist data is protected from anonymous access",
      false,
      error instanceof Error ? error.message : "Unknown wishlist access error.",
    );
  }
}

function addCheck(label, passed, detail = "") {
  checks.push({
    detail,
    label,
    status: passed ? "pass" : "fail",
  });
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;

  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim();

    if (!process.env[key]) process.env[key] = value;
  }
}
