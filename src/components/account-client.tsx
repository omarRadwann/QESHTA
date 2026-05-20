"use client";

import type { Session } from "@supabase/supabase-js";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import type { CustomerProfileInsert } from "@/lib/supabase/types";
import styles from "@/app/account/page.module.css";

type AuthMode = "sign-in" | "create-account";

type ProfileDraft = {
  fullName: string;
  marketingOptIn: boolean;
  phone: string;
};

const emptyProfile: ProfileDraft = {
  fullName: "",
  marketingOptIn: false,
  phone: "",
};

export function AccountClient() {
  const supabaseReady = isSupabaseConfigured();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile);
  const [isBooting, setIsBooting] = useState(supabaseReady);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const saveProfile = useCallback(
    async (
      activeSession: Session,
      nextProfile: ProfileDraft,
      userEmail: string,
      shouldThrow: boolean,
    ) => {
      const supabase = getSupabaseBrowserClient();
      const payload: CustomerProfileInsert = {
        email: userEmail,
        full_name: nextProfile.fullName.trim() || null,
        id: activeSession.user.id,
        marketing_opt_in: nextProfile.marketingOptIn,
        phone: nextProfile.phone.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error && shouldThrow) throw error;
    },
    [],
  );

  const loadProfile = useCallback(
    async (activeSession: Session) => {
      const supabase = getSupabaseBrowserClient();
      const userEmail = activeSession.user.email ?? "";

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, marketing_opt_in")
        .eq("id", activeSession.user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data) {
        const fallbackProfile = {
          ...emptyProfile,
          fullName:
            typeof activeSession.user.user_metadata.full_name === "string"
              ? activeSession.user.user_metadata.full_name
              : "",
        };

        await saveProfile(activeSession, fallbackProfile, userEmail, false);
        setProfile(fallbackProfile);
        return;
      }

      setProfile({
        fullName: data.full_name ?? "",
        marketingOptIn: data.marketing_opt_in,
        phone: data.phone ?? "",
      });
    },
    [saveProfile],
  );

  useEffect(() => {
    if (!supabaseReady) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function bootAccount() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        setMessage(error.message);
        setIsBooting(false);
        return;
      }

      setSession(data.session);
      setEmail(data.session?.user.email ?? "");

      if (data.session) {
        await loadProfile(data.session);
      }

      if (isMounted) setIsBooting(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setEmail(nextSession?.user.email ?? "");

      if (nextSession) {
        window.setTimeout(() => {
          void loadProfile(nextSession);
        }, 0);
      } else {
        setProfile(emptyProfile);
      }
    });

    void bootAccount();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, supabaseReady]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabaseReady) {
      setMessage("Account access is waiting for Supabase keys.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const cleanEmail = email.trim().toLowerCase();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;
        setPassword("");
        setMessage("Signed in.");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: signupName.trim(),
            },
          },
        });

        if (error) throw error;

        setPassword("");
        setMessage(
          data.session
            ? "Account created."
            : "Account created. Check the email inbox to confirm access.",
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      await saveProfile(session, profile, session.user.email ?? "", true);
      setMessage("Account saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
    else setMessage("Signed out.");

    setIsSubmitting(false);
  }

  if (!supabaseReady) {
    return (
      <section className={styles.panel} aria-labelledby="account-title">
        <p className={styles.eyebrow}>Account</p>
        <h1 id="account-title">Sign in is not configured yet.</h1>
        <p className={styles.supportCopy}>
          Add the Supabase URL and publishable key to the project environment to enable
          customer accounts.
        </p>
      </section>
    );
  }

  if (isBooting) {
    return (
      <section className={styles.panel} aria-labelledby="account-title">
        <p className={styles.eyebrow}>Account</p>
        <h1 id="account-title">Loading account...</h1>
      </section>
    );
  }

  if (session) {
    return (
      <section className={styles.panelWide} aria-labelledby="account-title">
        <div className={styles.accountHeader}>
          <div>
            <p className={styles.eyebrow}>Account</p>
            <h1 id="account-title">{profile.fullName || "QESHTA customer"}</h1>
            <p>{session.user.email}</p>
          </div>
          <button type="button" onClick={signOut} disabled={isSubmitting}>
            Sign Out
          </button>
        </div>

        <form className={styles.profileForm} onSubmit={handleProfileSubmit}>
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            name="fullName"
            type="text"
            value={profile.fullName}
            autoComplete="name"
            onChange={(event) =>
              setProfile((current) => ({ ...current, fullName: event.target.value }))
            }
          />

          <label htmlFor="profile-phone">Phone</label>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            value={profile.phone}
            autoComplete="tel"
            onChange={(event) =>
              setProfile((current) => ({ ...current, phone: event.target.value }))
            }
          />

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={profile.marketingOptIn}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  marketingOptIn: event.target.checked,
                }))
              }
            />
            Receive collection notes
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Account"}
          </button>
        </form>

        <div className={styles.summaryGrid}>
          <div>
            <span>Status</span>
            <strong>Signed in</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{session.user.email}</strong>
          </div>
        </div>

        {message ? <p className={styles.statusMessage}>{message}</p> : null}
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="account-title">
      <p className={styles.eyebrow}>Account</p>
      <h1 id="account-title">
        {mode === "sign-in" ? "Sign in to your account" : "Create an account"}
      </h1>

      <div className={styles.authTabs} role="tablist" aria-label="Account mode">
        <button
          type="button"
          className={mode === "sign-in" ? styles.activeTab : ""}
          onClick={() => {
            setMode("sign-in");
            setMessage("");
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={mode === "create-account" ? styles.activeTab : ""}
          onClick={() => {
            setMode("create-account");
            setMessage("");
          }}
        >
          Create
        </button>
      </div>

      <form className={styles.form} onSubmit={handleAuthSubmit}>
        {mode === "create-account" ? (
          <>
            <label htmlFor="account-name">Full name</label>
            <input
              id="account-name"
              name="fullName"
              type="text"
              value={signupName}
              autoComplete="name"
              onChange={(event) => setSignupName(event.target.value)}
            />
          </>
        ) : null}

        <label htmlFor="account-email">Email</label>
        <input
          id="account-email"
          name="email"
          type="email"
          value={email}
          autoComplete="email"
          required
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="account-password">Password</label>
        <input
          id="account-password"
          name="password"
          type="password"
          value={password}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={8}
          required
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Please wait..."
            : mode === "sign-in"
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>

      {message ? <p className={styles.statusMessage}>{message}</p> : null}
    </section>
  );
}
