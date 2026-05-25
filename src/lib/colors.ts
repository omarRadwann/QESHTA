// Maps QESHTA color names to representative hex values so product cards can
// derive a dynamic background tint. The admin can override per product via the
// catalog_products.color_hex column; this map is the fallback for color names.

const COLOR_HEX: Record<string, string> = {
  cocoa: "#6b4a35",
  chocolate: "#4a3526",
  brown: "#6b4a35",
  espresso: "#3a2a22",
  caramel: "#a86735",
  tan: "#c8a06a",
  beige: "#d9cbb3",
  cream: "#efeae0",
  ivory: "#e8e2d6",
  black: "#1a1a1a",
  charcoal: "#36363a",
  grey: "#8a8a8a",
  gray: "#8a8a8a",
  silver: "#c8c8cc",
  white: "#f3f1ec",
  burgundy: "#4b1719",
  grape: "#5b3a52",
  navy: "#171b3d",
  blue: "#2a3b66",
  green: "#39513f",
  olive: "#5b5a36",
  gold: "#c9a24b",
  rose: "#c08497",
  pink: "#d8a7b1",
  red: "#7c2230",
  core: "#cfc7ba",
};

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Resolve a color name (or raw hex string) to a hex value, if known. */
export function colorToHex(color?: string | null): string | undefined {
  if (!color) return undefined;
  const trimmed = color.trim();
  if (HEX_PATTERN.test(trimmed)) return trimmed;
  return COLOR_HEX[trimmed.toLowerCase()];
}

/**
 * Pick the best tint for a product: an explicit color_hex wins, otherwise we
 * derive one from the color name. Returns undefined when nothing is known so
 * the card falls back to its neutral background.
 */
export function productTint(
  colorHex?: string | null,
  colorName?: string | null,
): string | undefined {
  const explicit = colorHex?.trim();
  if (explicit && HEX_PATTERN.test(explicit)) return explicit;
  return colorToHex(colorName);
}
