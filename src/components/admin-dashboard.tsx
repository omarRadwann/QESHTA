"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { allProducts, formatPrice } from "@/data/products";
import { assetPath } from "@/lib/assets";
import {
  catalogStatuses,
  fetchAdminSnapshot,
  getAdminAccess,
  orderStatuses,
  updateCatalogProduct,
  updateCustomerRole,
  updateOrderStatus,
  type AdminSnapshot,
} from "@/lib/supabase/admin";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import type {
  AccountRole,
  CatalogProductStatus,
  CustomerProfile,
  Json,
  Order,
  OrderStatus,
} from "@/lib/supabase/types";
import styles from "./admin-dashboard.module.css";

type AdminView = "overview" | "orders" | "products" | "customers";
type AccessState = "booting" | "unconfigured" | "signed-out" | "denied" | "ready";
type StockDraft = {
  inventoryQuantity: string;
  lowStockThreshold: string;
};

const views: { label: string; value: AdminView }[] = [
  { label: "Overview", value: "overview" },
  { label: "Orders", value: "orders" },
  { label: "Products", value: "products" },
  { label: "Customers", value: "customers" },
];

const storefrontProductIds = new Set(allProducts.map((product) => product.id));

export function AdminDashboard() {
  const supabaseReady = isSupabaseConfigured();
  const [accessState, setAccessState] = useState<AccessState>(
    supabaseReady ? "booting" : "unconfigured",
  );
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<string, StockDraft>>({});
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!supabaseReady) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function bootAdmin() {
      setAccessState("booting");
      setMessage("");

      try {
        const access = await getAdminAccess(supabase);

        if (!isMounted) return;

        if (!access.session) {
          setAccessState("signed-out");
          setProfile(null);
          setSnapshot(null);
          return;
        }

        if (!access.profile) {
          setAccessState("denied");
          setProfile(null);
          setSnapshot(null);
          return;
        }

        const nextSnapshot = await fetchAdminSnapshot(supabase);

        if (!isMounted) return;

        setProfile(access.profile);
        setSnapshot(nextSnapshot);
        setStockDrafts(makeStockDrafts(nextSnapshot.catalogProducts));
        setAccessState("ready");
      } catch (error) {
        if (!isMounted) return;
        setAccessState("denied");
        setMessage(error instanceof Error ? error.message : "Admin access failed.");
      }
    }

    void bootAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void bootAdmin();
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseReady]);

  const orderItemsByOrder = useMemo(() => {
    const map = new Map<string, AdminSnapshot["orderItems"]>();

    snapshot?.orderItems.forEach((item) => {
      const currentItems = map.get(item.order_id) ?? [];
      currentItems.push(item);
      map.set(item.order_id, currentItems);
    });

    return map;
  }, [snapshot]);

  const metrics = useMemo(() => {
    const orders = snapshot?.orders ?? [];
    const products = snapshot?.catalogProducts ?? [];
    const profiles = snapshot?.profiles ?? [];
    const revenue = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((total, order) => total + Number(order.total), 0);
    const pendingOrders = orders.filter((order) => order.status === "pending_review");
    const lowStockProducts = products.filter(
      (product) => product.inventory_quantity <= product.low_stock_threshold,
    );

    return {
      customers: profiles.length,
      lowStock: lowStockProducts.length,
      orders: orders.length,
      pending: pendingOrders.length,
      revenue,
    };
  }, [snapshot]);

  async function refreshSnapshot(successMessage?: string) {
    const supabase = getSupabaseBrowserClient();
    const nextSnapshot = await fetchAdminSnapshot(supabase);
    setSnapshot(nextSnapshot);
    setStockDrafts(makeStockDrafts(nextSnapshot.catalogProducts));
    if (successMessage) setMessage(successMessage);
  }

  async function handleOrderStatus(order: Order, status: OrderStatus) {
    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await updateOrderStatus(supabase, order.id, status);
      setSnapshot((current) =>
        current
          ? {
              ...current,
              orders: current.orders.map((item) =>
                item.id === order.id
                  ? { ...item, status, updated_at: new Date().toISOString() }
                  : item,
              ),
            }
          : current,
      );
      setMessage(`Order ${order.order_number} updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleProductPatch(
    productId: string,
    patch: {
      allow_backorder?: boolean;
      featured?: boolean;
      status?: CatalogProductStatus;
    },
  ) {
    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await updateCatalogProduct(supabase, productId, patch);
      await refreshSnapshot("Product settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleProductStockSave(productId: string) {
    const draft = stockDrafts[productId];
    if (!draft) return;

    const inventoryQuantity = Number(draft.inventoryQuantity);
    const lowStockThreshold = Number(draft.lowStockThreshold);

    if (
      !Number.isInteger(inventoryQuantity) ||
      inventoryQuantity < 0 ||
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      setMessage("Stock and threshold must be whole numbers greater than or equal to 0.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await updateCatalogProduct(supabase, productId, {
        inventory_quantity: inventoryQuantity,
        low_stock_threshold: lowStockThreshold,
      });
      await refreshSnapshot("Inventory saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Inventory update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleChange(customer: CustomerProfile, role: AccountRole) {
    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await updateCustomerRole(supabase, customer.id, role);
      await refreshSnapshot(`${customer.email} is now ${role}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Role update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  if (accessState === "unconfigured") {
    return (
      <AdminState
        title="Admin is waiting for Supabase"
        body="Add the public Supabase environment variables before opening the dashboard."
      />
    );
  }

  if (accessState === "booting") {
    return <AdminState title="Loading admin" body="Checking account permissions..." />;
  }

  if (accessState === "signed-out") {
    return (
      <AdminState
        title="Admin sign in required"
        body="Sign in with an admin account before opening the back office."
        action={<Link href="/account/">Go to Account</Link>}
      />
    );
  }

  if (accessState === "denied") {
    return (
      <AdminState
        title="Admin access denied"
        body={message || "This account is not assigned the admin role."}
        action={<Link href="/account/">Switch Account</Link>}
      />
    );
  }

  if (!snapshot) {
    return <AdminState title="Loading data" body="Preparing dashboard..." />;
  }

  return (
    <section className={styles.dashboard} aria-labelledby="admin-title">
      <div className={styles.adminHeader}>
        <div>
          <p>Back office</p>
          <h1 id="admin-title">QESHTA Admin</h1>
          <span>{profile?.email}</span>
        </div>
        <Link href="/shop/">View storefront</Link>
      </div>

      <nav className={styles.viewTabs} aria-label="Admin sections">
        {views.map((view) => (
          <button
            key={view.value}
            className={activeView === view.value ? styles.activeView : ""}
            type="button"
            onClick={() => {
              setActiveView(view.value);
              setMessage("");
            }}
          >
            {view.label}
          </button>
        ))}
      </nav>

      {message ? <p className={styles.statusMessage}>{message}</p> : null}

      {activeView === "overview" ? (
        <>
          <div className={styles.metrics} aria-label="Store metrics">
            <Metric label="Revenue" value={`$${formatPrice(metrics.revenue)}`} />
            <Metric label="Orders" value={String(metrics.orders)} />
            <Metric label="Pending" value={String(metrics.pending)} />
            <Metric label="Customers" value={String(metrics.customers)} />
            <Metric label="Low stock" value={String(metrics.lowStock)} />
          </div>

          <div className={styles.splitSection}>
            <section aria-labelledby="latest-orders-title">
              <h2 id="latest-orders-title">Latest orders</h2>
              <OrderTable
                disabled={isSaving}
                itemsByOrder={orderItemsByOrder}
                onStatusChange={handleOrderStatus}
                orders={snapshot.orders.slice(0, 6)}
              />
            </section>

            <section aria-labelledby="stock-watch-title">
              <h2 id="stock-watch-title">Stock watch</h2>
              <ProductTable
                disabled={isSaving}
                drafts={stockDrafts}
                onDraftChange={setStockDrafts}
                onPatch={handleProductPatch}
                onStockSave={handleProductStockSave}
                products={snapshot.catalogProducts
                  .filter(
                    (product) =>
                      product.inventory_quantity <= product.low_stock_threshold,
                  )
                  .slice(0, 6)}
              />
            </section>
          </div>
        </>
      ) : null}

      {activeView === "orders" ? (
        <section aria-labelledby="orders-title">
          <h2 id="orders-title">Orders</h2>
          <OrderTable
            disabled={isSaving}
            itemsByOrder={orderItemsByOrder}
            onStatusChange={handleOrderStatus}
            orders={snapshot.orders}
          />
        </section>
      ) : null}

      {activeView === "products" ? (
        <section aria-labelledby="products-title">
          <h2 id="products-title">Product operations</h2>
          <ProductTable
            disabled={isSaving}
            drafts={stockDrafts}
            onDraftChange={setStockDrafts}
            onPatch={handleProductPatch}
            onStockSave={handleProductStockSave}
            products={snapshot.catalogProducts}
          />
        </section>
      ) : null}

      {activeView === "customers" ? (
        <section aria-labelledby="customers-title">
          <h2 id="customers-title">Customers</h2>
          <CustomerTable
            currentAdminId={profile?.id}
            customers={snapshot.profiles}
            disabled={isSaving}
            onRoleChange={handleRoleChange}
          />
        </section>
      ) : null}
    </section>
  );
}

function AdminState({
  action,
  body,
  title,
}: {
  action?: ReactNode;
  body: string;
  title: string;
}) {
  return (
    <section className={styles.statePanel} aria-labelledby="admin-state-title">
      <p>Back office</p>
      <h1 id="admin-state-title">{title}</h1>
      <span>{body}</span>
      {action ? <div className={styles.stateAction}>{action}</div> : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OrderTable({
  disabled,
  itemsByOrder,
  onStatusChange,
  orders,
}: {
  disabled: boolean;
  itemsByOrder: Map<string, AdminSnapshot["orderItems"]>;
  onStatusChange: (order: Order, status: OrderStatus) => void;
  orders: Order[];
}) {
  if (orders.length === 0) {
    return <p className={styles.empty}>No orders yet.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const items = itemsByOrder.get(order.id) ?? [];

            return (
              <tr key={order.id}>
                <td>
                  <strong>{order.order_number}</strong>
                  <span>{formatAddress(order.shipping_address)}</span>
                </td>
                <td>
                  <strong>{order.customer_name}</strong>
                  <span>{order.customer_email}</span>
                </td>
                <td>{items.length > 0 ? summarizeItems(items) : "No items"}</td>
                <td>${formatPrice(Number(order.total))}</td>
                <td>
                  <select
                    aria-label={`Status for ${order.order_number}`}
                    disabled={disabled}
                    value={order.status}
                    onChange={(event) =>
                      onStatusChange(order, event.target.value as OrderStatus)
                    }
                  >
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{formatDate(order.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductTable({
  disabled,
  drafts,
  onDraftChange,
  onPatch,
  onStockSave,
  products,
}: {
  disabled: boolean;
  drafts: Record<string, StockDraft>;
  onDraftChange: Dispatch<SetStateAction<Record<string, StockDraft>>>;
  onPatch: (
    productId: string,
    patch: {
      allow_backorder?: boolean;
      featured?: boolean;
      status?: CatalogProductStatus;
    },
  ) => void;
  onStockSave: (productId: string) => void;
  products: AdminSnapshot["catalogProducts"];
}) {
  if (products.length === 0) {
    return <p className={styles.empty}>No products need attention.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Status</th>
            <th>Stock</th>
            <th>Threshold</th>
            <th>Backorder</th>
            <th>Featured</th>
            <th>Sync</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const draft = drafts[product.product_id] ?? {
              inventoryQuantity: String(product.inventory_quantity),
              lowStockThreshold: String(product.low_stock_threshold),
            };
            const isLinked = storefrontProductIds.has(product.product_id);

            return (
              <tr key={product.product_id}>
                <td>
                  <div className={styles.productCell}>
                    <img
                      src={assetPath(product.image)}
                      alt=""
                      width={72}
                      height={72}
                      loading="lazy"
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {product.category} / ${formatPrice(Number(product.price))}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    aria-label={`Status for ${product.name}`}
                    disabled={disabled}
                    value={product.status}
                    onChange={(event) =>
                      onPatch(product.product_id, {
                        status: event.target.value as CatalogProductStatus,
                      })
                    }
                  >
                    {catalogStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    aria-label={`Inventory for ${product.name}`}
                    disabled={disabled}
                    min={0}
                    type="number"
                    value={draft.inventoryQuantity}
                    onChange={(event) =>
                      onDraftChange((current) => ({
                        ...current,
                        [product.product_id]: {
                          ...draft,
                          inventoryQuantity: event.target.value,
                        },
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    aria-label={`Low stock threshold for ${product.name}`}
                    disabled={disabled}
                    min={0}
                    type="number"
                    value={draft.lowStockThreshold}
                    onChange={(event) =>
                      onDraftChange((current) => ({
                        ...current,
                        [product.product_id]: {
                          ...draft,
                          lowStockThreshold: event.target.value,
                        },
                      }))
                    }
                  />
                </td>
                <td>
                  <label className={styles.switchLabel}>
                    <input
                      checked={product.allow_backorder}
                      disabled={disabled}
                      type="checkbox"
                      onChange={(event) =>
                        onPatch(product.product_id, {
                          allow_backorder: event.target.checked,
                        })
                      }
                    />
                    Allow
                  </label>
                </td>
                <td>
                  <label className={styles.switchLabel}>
                    <input
                      checked={product.featured}
                      disabled={disabled}
                      type="checkbox"
                      onChange={(event) =>
                        onPatch(product.product_id, {
                          featured: event.target.checked,
                        })
                      }
                    />
                    Feature
                  </label>
                </td>
                <td>
                  <button
                    className={styles.tableButton}
                    disabled={disabled}
                    type="button"
                    onClick={() => onStockSave(product.product_id)}
                  >
                    Save
                  </button>
                  {!isLinked ? <span className={styles.warning}>Missing route</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CustomerTable({
  currentAdminId,
  customers,
  disabled,
  onRoleChange,
}: {
  currentAdminId?: string;
  customers: CustomerProfile[];
  disabled: boolean;
  onRoleChange: (customer: CustomerProfile, role: AccountRole) => void;
}) {
  if (customers.length === 0) {
    return <p className={styles.empty}>No customer accounts yet.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Marketing</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const isCurrentAdmin = currentAdminId === customer.id;

            return (
              <tr key={customer.id}>
                <td>
                  <strong>{customer.full_name || "Unnamed customer"}</strong>
                  <span>{customer.email}</span>
                </td>
                <td>{customer.phone || "Not added"}</td>
                <td>{customer.marketing_opt_in ? "Opted in" : "No"}</td>
                <td>
                  <select
                    aria-label={`Role for ${customer.email}`}
                    disabled={disabled || isCurrentAdmin}
                    value={customer.role}
                    onChange={(event) =>
                      onRoleChange(customer, event.target.value as AccountRole)
                    }
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                  {isCurrentAdmin ? <span>Current admin</span> : null}
                </td>
                <td>{formatDate(customer.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function makeStockDrafts(products: AdminSnapshot["catalogProducts"]) {
  return Object.fromEntries(
    products.map((product) => [
      product.product_id,
      {
        inventoryQuantity: String(product.inventory_quantity),
        lowStockThreshold: String(product.low_stock_threshold),
      },
    ]),
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function summarizeItems(items: AdminSnapshot["orderItems"]) {
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
