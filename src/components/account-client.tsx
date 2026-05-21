"use client";

import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/data/products";
import {
  getSupabaseBrowserClient,
  isGoogleOAuthEnabled,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import {
  fetchCustomerOrders,
  type CustomerOrder,
} from "@/lib/supabase/orders";
import type { CustomerProfileInsert, Json } from "@/lib/supabase/types";
import styles from "@/app/account/page.module.css";

type AuthMode = "sign-in" | "create-account";

type ProfileDraft = {
  fullName: string;
  marketingOptIn: boolean;
  phone: string;
  role: "customer" | "admin";
};

const emptyProfile: ProfileDraft = {
  fullName: "",
  marketingOptIn: false,
  phone: "",
  role: "customer",
};

export function AccountClient() {
  const supabaseReady = isSupabaseConfigured();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);
  const [isBooting, setIsBooting] = useState(supabaseReady);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
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
        .select("full_name, phone, marketing_opt_in, role")
        .eq("id", activeSession.user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data) {
        const fallbackProfile: ProfileDraft = {
          ...emptyProfile,
          fullName: getSessionDisplayName(activeSession),
          role: "customer",
        };

        await saveProfile(activeSession, fallbackProfile, userEmail, false);
        setProfile(fallbackProfile);
        return;
      }

      setProfile({
        fullName: data.full_name ?? "",
        marketingOptIn: data.marketing_opt_in,
        phone: data.phone ?? "",
        role: data.role === "admin" ? "admin" : "customer",
      });
    },
    [saveProfile],
  );

  const loadOrders = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    setIsOrdersLoading(true);

    try {
      const customerOrders = await fetchCustomerOrders(supabase);
      setOrders(customerOrders);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order history failed to load.");
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabaseReady) return;

    let isMounted = true;

    void isGoogleOAuthEnabled().then((isEnabled) => {
      if (isMounted) setGoogleOAuthEnabled(isEnabled);
    });

    return () => {
      isMounted = false;
    };
  }, [supabaseReady]);

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
        await Promise.all([loadProfile(data.session), loadOrders()]);
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
          void loadOrders();
        }, 0);
      } else {
        setProfile(emptyProfile);
        setOrders([]);
      }
    });

    void bootAccount();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadOrders, loadProfile, supabaseReady]);

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

  async function handleGoogleSignIn() {
    if (!supabaseReady) {
      setMessage("Account access is waiting for Supabase keys.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            prompt: "select_account",
          },
          redirectTo: getAccountRedirectUrl(),
        },
      });

      if (error) throw error;
      setMessage("Redirecting to Google...");
    } catch (error) {
      setIsSubmitting(false);
      setMessage(error instanceof Error ? error.message : "Google sign-in failed.");
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
            <span>Role</span>
            <strong>{profile.role}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{session.user.email}</strong>
          </div>
        </div>

        {profile.role === "admin" ? (
          <Link className={styles.adminLink} href="/admin/">
            Open Admin Dashboard
          </Link>
        ) : null}

        <OrderHistory isLoading={isOrdersLoading} orders={orders} />

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

      {googleOAuthEnabled ? (
        <>
          <button
            className={styles.oauthButton}
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </button>

          <div className={styles.oauthDivider} aria-hidden="true">
            <span />
            <strong>or</strong>
            <span />
          </div>
        </>
      ) : null}

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

function OrderHistory({
  isLoading,
  orders,
}: {
  isLoading: boolean;
  orders: CustomerOrder[];
}) {
  return (
    <section className={styles.orderHistory} aria-labelledby="account-orders-title">
      <div className={styles.sectionHeading}>
        <h2 id="account-orders-title">Order history</h2>
        <span>
          {isLoading
            ? "Loading"
            : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyOrders}>
          <p>{isLoading ? "Loading order history..." : "No orders yet."}</p>
          {!isLoading ? <Link href="/shop/">Start Shopping</Link> : null}
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <article key={order.id} className={styles.orderItem}>
              <div className={styles.orderMeta}>
                <div>
                  <h3>{order.order_number}</h3>
                  <p>{formatDate(order.created_at)}</p>
                </div>
                <strong>${formatPrice(Number(order.total))}</strong>
              </div>
              <div className={styles.orderDetails}>
                <span>{formatOrderStatus(order.status)}</span>
                <span>{formatAddress(order.shipping_address)}</span>
              </div>
              <p>{summarizeItems(order.items)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatOrderStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarizeItems(items: CustomerOrder["items"]) {
  if (items.length === 0) return "No items recorded.";

  return items
    .map((item) => `${item.quantity} x ${item.name} / ${item.size}`)
    .join(", ");
}

function formatAddress(address: Json) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return "No address";
  }

  const value = address as Record<string, Json>;
  return [value.addressLine1, value.city, value.country]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(", ");
}

function getAccountRedirectUrl() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL;
  const normalizedBasePath =
    basePath.length > 0 ? `/${basePath.replace(/^\/+|\/+$/g, "")}` : "";

  return `${origin}${normalizedBasePath}/account/`;
}

function getSessionDisplayName(activeSession: Session) {
  const metadata = activeSession.user.user_metadata;

  if (typeof metadata.full_name === "string") return metadata.full_name;
  if (typeof metadata.name === "string") return metadata.name;

  return "";
}
