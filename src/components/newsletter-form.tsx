"use client";

import { useId, useState, type FormEvent } from "react";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { subscribeToNewsletter } from "@/lib/supabase/newsletter";
import styles from "./newsletter-form.module.css";

type NewsletterStatus = "idle" | "submitting" | "success" | "error";

type NewsletterFormProps = {
  /** Structural class from the host CSS module — controls layout + field styling. */
  className?: string;
  /** Source tag stored with the subscription, e.g. "home" or "footer". */
  source: string;
  buttonLabel?: string;
  /** Optional heading/description rendered inside the form (footer variant). */
  heading?: string;
  description?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({
  className,
  source,
  buttonLabel = "Join",
  heading,
  description,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [message, setMessage] = useState("");
  const inputId = useId();
  const statusId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();

    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    // Local/dev builds may run without Supabase keys — fail gracefully, never throw.
    if (!isSupabaseConfigured()) {
      setStatus("success");
      setMessage("Subscriptions open at launch — thank you for your interest.");
      setEmail("");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await subscribeToNewsletter(supabase, trimmed, source);
      setStatus("success");
      setMessage("You're on the list. Watch your inbox for collection notes.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  const isSubmitting = status === "submitting";
  const statusClassName = [
    styles.status,
    status === "error" ? styles.statusError : "",
    status === "success" ? styles.statusSuccess : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form className={className} onSubmit={handleSubmit} noValidate>
      {heading ? <h2>{heading}</h2> : null}
      {description ? <p>{description}</p> : null}
      <label htmlFor={inputId}>Email</label>
      <div>
        <input
          id={inputId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
          aria-describedby={message ? statusId : undefined}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-label="Subscribe to the newsletter"
        >
          {buttonLabel}
        </button>
      </div>
      <p id={statusId} className={statusClassName} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
