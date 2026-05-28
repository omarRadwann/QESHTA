import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, NewsletterSubscriberInsert } from "./types";

export type NewsletterResult = "subscribed" | "already-subscribed";

/**
 * Adds an email to the newsletter list. The list is insert-only for the public,
 * so we never read it back from the client. A duplicate email (unique violation
 * on lower(email)) is treated as success — the visitor is already subscribed and
 * we avoid leaking whether the address exists.
 */
export async function subscribeToNewsletter(
  supabase: SupabaseClient<Database>,
  email: string,
  source: string,
): Promise<NewsletterResult> {
  const row: NewsletterSubscriberInsert = { email: email.trim(), source };

  const { error } = await supabase.from("newsletter_subscribers").insert(row);

  if (error) {
    if (error.code === "23505") return "already-subscribed";
    throw error;
  }

  return "subscribed";
}
