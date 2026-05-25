import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const PRODUCT_IMAGE_BUCKET = "qeshta-product-images";
export const CONTENT_IMAGE_BUCKET = "qeshta-content-images";
const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const imageTypeExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadProductImage(
  supabase: SupabaseClient<Database>,
  file: File,
  productId: string,
) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or GIF image.");
  }

  if (file.size > maxImageSize) {
    throw new Error("Product images must be 10MB or smaller.");
  }

  const extension = getFileExtension(file);
  const safeProductId = sanitizeStorageSegment(productId) || "product";
  const safeName = sanitizeStorageSegment(file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `${safeProductId}/${Date.now()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadContentImage(
  supabase: SupabaseClient<Database>,
  file: File,
  slot: string,
) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or GIF image.");
  }

  if (file.size > maxImageSize) {
    throw new Error("Banner images must be 10MB or smaller.");
  }

  const extension = getFileExtension(file);
  const safeSlot = sanitizeStorageSegment(slot) || "banner";
  const safeName = sanitizeStorageSegment(file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `${safeSlot}/${Date.now()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from(CONTENT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(CONTENT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function getFileExtension(file: File) {
  return imageTypeExtensions[file.type] ?? "jpg";
}

function sanitizeStorageSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
