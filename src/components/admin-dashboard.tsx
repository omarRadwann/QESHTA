"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  Fragment,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  allProducts,
  formatPrice,
  getProductById,
  shopCategories,
} from "@/data/products";
import { assetPath } from "@/lib/assets";
import {
  catalogStatuses,
  createCatalogProduct,
  deleteCatalogProduct,
  fetchAdminSnapshot,
  getAdminAccess,
  orderStatuses,
  updateCatalogProduct,
  updateCustomerRole,
  updateOrderManagement,
  type AdminSnapshot,
} from "@/lib/supabase/admin";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/supabase/storage";
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
type OrderDraft = {
  notes: string;
  status: OrderStatus;
};
type ProductDraft = {
  alt: string;
  category: string;
  collection: string;
  color: string;
  description: string;
  detailHeroAlt: string;
  detailHeroImage: string;
  detailTabsJson: string;
  image: string;
  inventoryQuantity: string;
  isNew: boolean;
  lowStockThreshold: string;
  material: string;
  name: string;
  price: string;
  tags: string;
  variantsJson: string;
};

type NewProductDraft = ProductDraft & {
  allowBackorder: boolean;
  featured: boolean;
  productId: string;
  status: CatalogProductStatus;
};

const views: { label: string; value: AdminView }[] = [
  { label: "Overview", value: "overview" },
  { label: "Orders", value: "orders" },
  { label: "Products", value: "products" },
  { label: "Customers", value: "customers" },
];

const storefrontProductIds = new Set(allProducts.map((product) => product.id));
const productCategoryOptions = shopCategories.filter(
  (category): category is Exclude<(typeof shopCategories)[number], "View All"> =>
    category !== "View All",
);

export function AdminDashboard() {
  const supabaseReady = isSupabaseConfigured();
  const [accessState, setAccessState] = useState<AccessState>(
    supabaseReady ? "booting" : "unconfigured",
  );
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, OrderDraft>>({});
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [productDrafts, setProductDrafts] = useState<Record<string, ProductDraft>>({});
  const [newProductDraft, setNewProductDraft] = useState<NewProductDraft>(
    makeEmptyProductDraft,
  );
  const [adminQuery, setAdminQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>(
    "all",
  );
  const [productStatusFilter, setProductStatusFilter] = useState<
    "all" | CatalogProductStatus
  >("all");
  const [customerRoleFilter, setCustomerRoleFilter] = useState<"all" | AccountRole>(
    "all",
  );
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
        setOrderDrafts(makeOrderDrafts(nextSnapshot.orders));
        setProductDrafts(makeProductDrafts(nextSnapshot.catalogProducts));
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

  const normalizedAdminQuery = adminQuery.trim().toLowerCase();
  const filteredOrders = useMemo(() => {
    const orders = snapshot?.orders ?? [];

    return orders.filter((order) => {
      const items = orderItemsByOrder.get(order.id) ?? [];
      const statusMatch =
        orderStatusFilter === "all" || order.status === orderStatusFilter;
      const queryMatch =
        normalizedAdminQuery.length === 0 ||
        [
          order.order_number,
          order.customer_name,
          order.customer_email,
          order.phone ?? "",
          order.status,
          formatAddress(order.shipping_address),
          summarizeItems(items),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedAdminQuery);

      return statusMatch && queryMatch;
    });
  }, [normalizedAdminQuery, orderItemsByOrder, orderStatusFilter, snapshot]);

  const filteredProducts = useMemo(() => {
    const products = snapshot?.catalogProducts ?? [];

    return products.filter((product) => {
      const statusMatch =
        productStatusFilter === "all" || product.status === productStatusFilter;
      const queryMatch =
        normalizedAdminQuery.length === 0 ||
        [
          product.product_id,
          product.name,
          product.category,
          product.status,
          product.inventory_quantity,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedAdminQuery);

      return statusMatch && queryMatch;
    });
  }, [normalizedAdminQuery, productStatusFilter, snapshot]);

  const filteredCustomers = useMemo(() => {
    const profiles = snapshot?.profiles ?? [];

    return profiles.filter((customer) => {
      const roleMatch =
        customerRoleFilter === "all" || customer.role === customerRoleFilter;
      const queryMatch =
        normalizedAdminQuery.length === 0 ||
        [
          customer.email,
          customer.full_name ?? "",
          customer.phone ?? "",
          customer.role,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedAdminQuery);

      return roleMatch && queryMatch;
    });
  }, [customerRoleFilter, normalizedAdminQuery, snapshot]);

  async function refreshSnapshot(successMessage?: string) {
    const supabase = getSupabaseBrowserClient();
    const nextSnapshot = await fetchAdminSnapshot(supabase);
    setSnapshot(nextSnapshot);
    setOrderDrafts(makeOrderDrafts(nextSnapshot.orders));
    setProductDrafts(makeProductDrafts(nextSnapshot.catalogProducts));
    if (successMessage) setMessage(successMessage);
  }

  async function handleOrderSave(order: Order) {
    const draft = orderDrafts[order.id] ?? makeOrderDraft(order);
    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await updateOrderManagement(supabase, order.id, {
        notes: nullIfBlank(draft.notes),
        status: draft.status,
      });
      setSnapshot((current) =>
        current
          ? {
              ...current,
              orders: current.orders.map((item) =>
                item.id === order.id
                  ? {
                      ...item,
                      notes: nullIfBlank(draft.notes),
                      status: draft.status,
                      updated_at: new Date().toISOString(),
                    }
                  : item,
              ),
            }
          : current,
      );
      setMessage(`Order ${order.order_number} saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageUpload(
    file: File,
    productId: string,
    onUploaded: (publicUrl: string) => void,
  ) {
    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const publicUrl = await uploadProductImage(supabase, file, productId);
      onUploaded(publicUrl);
      setMessage("Image uploaded. Save the product to publish the new image.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
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

  async function handleProductSave(productId: string) {
    const draft = productDrafts[productId];
    if (!draft) return;

    const productPayload = buildProductPayloadFromDraft(draft);
    if ("error" in productPayload) {
      setMessage(productPayload.error || "Product validation failed.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await updateCatalogProduct(supabase, productId, productPayload.value);
      await refreshSnapshot("Product saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleProductCreate() {
    const productId = normalizeProductId(newProductDraft.productId);
    if (!productId) {
      setMessage("Product ID is required.");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productId)) {
      setMessage("Product ID must use lowercase letters, numbers, and hyphens.");
      return;
    }

    if (snapshot?.catalogProducts.some((product) => product.product_id === productId)) {
      setMessage("A product with this ID already exists.");
      return;
    }

    const productPayload = buildProductPayloadFromDraft(newProductDraft);
    if ("error" in productPayload) {
      setMessage(productPayload.error || "Product validation failed.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await createCatalogProduct(supabase, {
        ...productPayload.value,
        allow_backorder: newProductDraft.allowBackorder,
        featured: newProductDraft.featured,
        product_id: productId,
        status: newProductDraft.status,
      });
      setNewProductDraft(makeEmptyProductDraft());
      await refreshSnapshot("Product created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product create failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleProductDelete(productId: string, name: string) {
    if (!window.confirm(`Delete ${name} from the live catalog?`)) return;

    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      await deleteCatalogProduct(supabase, productId);
      await refreshSnapshot("Product deleted from catalog.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product delete failed.");
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

  async function handleManualRefresh() {
    setIsSaving(true);
    setMessage("");

    try {
      await refreshSnapshot("Dashboard refreshed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Refresh failed.");
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
        <div className={styles.headerActions}>
          <button type="button" disabled={isSaving} onClick={handleManualRefresh}>
            Refresh
          </button>
          <Link href="/shop/">View storefront</Link>
        </div>
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
                expandedOrderId={expandedOrderId}
                itemsByOrder={orderItemsByOrder}
                drafts={orderDrafts}
                onDraftChange={setOrderDrafts}
                onOrderSave={handleOrderSave}
                onToggleExpanded={setExpandedOrderId}
                orders={snapshot.orders.slice(0, 6)}
              />
            </section>

            <section aria-labelledby="stock-watch-title">
              <h2 id="stock-watch-title">Stock watch</h2>
              <ProductTable
                disabled={isSaving}
                drafts={productDrafts}
                onDraftChange={setProductDrafts}
                onDelete={handleProductDelete}
                onImageUpload={(productId, file, _field, onUploaded) =>
                  handleImageUpload(file, productId, onUploaded)
                }
                onPatch={handleProductPatch}
                onProductSave={handleProductSave}
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
          <SectionHeading
            title="Orders"
            id="orders-title"
            meta={`${filteredOrders.length} shown`}
          />
          <AdminControls
            query={adminQuery}
            queryLabel="Search orders"
            onQueryChange={setAdminQuery}
            filter={
              <select
                aria-label="Filter orders by status"
                value={orderStatusFilter}
                onChange={(event) =>
                  setOrderStatusFilter(event.target.value as "all" | OrderStatus)
                }
              >
                <option value="all">All statuses</option>
                {orderStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            }
          />
          <OrderTable
            disabled={isSaving}
            expandedOrderId={expandedOrderId}
            itemsByOrder={orderItemsByOrder}
            drafts={orderDrafts}
            onDraftChange={setOrderDrafts}
            onOrderSave={handleOrderSave}
            onToggleExpanded={setExpandedOrderId}
            orders={filteredOrders}
          />
        </section>
      ) : null}

      {activeView === "products" ? (
        <section aria-labelledby="products-title">
          <SectionHeading
            title="Product operations"
            id="products-title"
            meta={`${filteredProducts.length} shown`}
          />
          <AdminControls
            query={adminQuery}
            queryLabel="Search products"
            onQueryChange={setAdminQuery}
            filter={
              <select
                aria-label="Filter products by status"
                value={productStatusFilter}
                onChange={(event) =>
                  setProductStatusFilter(
                    event.target.value as "all" | CatalogProductStatus,
                  )
                }
              >
                <option value="all">All statuses</option>
                {catalogStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            }
          />
          <ProductCreateForm
            disabled={isSaving}
            draft={newProductDraft}
            onChange={setNewProductDraft}
            onCreate={handleProductCreate}
            onImageUpload={(file, field, onUploaded) => {
              const productScope = normalizeProductId(
                newProductDraft.productId || newProductDraft.name || "new-product",
              );
              void handleImageUpload(file, productScope, onUploaded);
            }}
          />
          <ProductTable
            disabled={isSaving}
            drafts={productDrafts}
            onDraftChange={setProductDrafts}
            onDelete={handleProductDelete}
            onImageUpload={(productId, file, _field, onUploaded) =>
              handleImageUpload(file, productId, onUploaded)
            }
            onPatch={handleProductPatch}
            onProductSave={handleProductSave}
            products={filteredProducts}
          />
        </section>
      ) : null}

      {activeView === "customers" ? (
        <section aria-labelledby="customers-title">
          <SectionHeading
            title="Customers"
            id="customers-title"
            meta={`${filteredCustomers.length} shown`}
          />
          <AdminControls
            query={adminQuery}
            queryLabel="Search customers"
            onQueryChange={setAdminQuery}
            filter={
              <select
                aria-label="Filter customers by role"
                value={customerRoleFilter}
                onChange={(event) =>
                  setCustomerRoleFilter(event.target.value as "all" | AccountRole)
                }
              >
                <option value="all">All roles</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            }
          />
          <CustomerTable
            currentAdminId={profile?.id}
            customers={filteredCustomers}
            disabled={isSaving}
            onRoleChange={handleRoleChange}
          />
        </section>
      ) : null}
    </section>
  );
}

function SectionHeading({
  id,
  meta,
  title,
}: {
  id: string;
  meta: string;
  title: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <h2 id={id}>{title}</h2>
      <span>{meta}</span>
    </div>
  );
}

function AdminControls({
  filter,
  onQueryChange,
  query,
  queryLabel,
}: {
  filter: ReactNode;
  onQueryChange: (query: string) => void;
  query: string;
  queryLabel: string;
}) {
  return (
    <div className={styles.adminControls}>
      <label>
        <span>{queryLabel}</span>
        <input
          type="search"
          value={query}
          placeholder="Search"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      {filter}
    </div>
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
  drafts,
  disabled,
  expandedOrderId,
  itemsByOrder,
  onDraftChange,
  onOrderSave,
  onToggleExpanded,
  orders,
}: {
  drafts: Record<string, OrderDraft>;
  disabled: boolean;
  expandedOrderId: string | null;
  itemsByOrder: Map<string, AdminSnapshot["orderItems"]>;
  onDraftChange: Dispatch<SetStateAction<Record<string, OrderDraft>>>;
  onOrderSave: (order: Order) => void;
  onToggleExpanded: Dispatch<SetStateAction<string | null>>;
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
            <th>Manage</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const items = itemsByOrder.get(order.id) ?? [];
            const draft = drafts[order.id] ?? makeOrderDraft(order);
            const isExpanded = expandedOrderId === order.id;
            const updateDraft = (patch: Partial<OrderDraft>) =>
              onDraftChange((current) => ({
                ...current,
                [order.id]: {
                  ...draft,
                  ...patch,
                },
              }));

            return (
              <Fragment key={order.id}>
                <tr>
                  <td>
                    <strong>{order.order_number}</strong>
                    <span>{formatDate(order.created_at)}</span>
                    <span>{formatAddress(order.shipping_address)}</span>
                  </td>
                  <td>
                    <strong>{order.customer_name}</strong>
                    <span>{order.customer_email}</span>
                    <span>{order.phone || "No phone"}</span>
                  </td>
                  <td>{items.length > 0 ? summarizeItems(items) : "No items"}</td>
                  <td>
                    <strong>${formatPrice(Number(order.total))}</strong>
                    <span>{order.currency}</span>
                  </td>
                  <td>
                    <select
                      aria-label={`Status for ${order.order_number}`}
                      disabled={disabled}
                      value={draft.status}
                      onChange={(event) =>
                        updateDraft({ status: event.target.value as OrderStatus })
                      }
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className={styles.actionStack}>
                      <button
                        className={styles.tableButton}
                        disabled={disabled}
                        type="button"
                        onClick={() => onOrderSave(order)}
                      >
                        Save
                      </button>
                      <button
                        className={styles.tableButton}
                        disabled={disabled}
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          onToggleExpanded((current) =>
                            current === order.id ? null : order.id,
                          )
                        }
                      >
                        {isExpanded ? "Hide" : "Details"}
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded ? (
                  <tr className={styles.orderDetailRow}>
                    <td colSpan={6}>
                      <div className={styles.orderDetailGrid}>
                        <section aria-label={`${order.order_number} contact`}>
                          <h3>Customer</h3>
                          <p>{order.customer_name}</p>
                          <a href={`mailto:${order.customer_email}`}>
                            {order.customer_email}
                          </a>
                          <span>{order.phone || "No phone added"}</span>
                        </section>
                        <section aria-label={`${order.order_number} shipping`}>
                          <h3>Shipping</h3>
                          <p>{formatAddress(order.shipping_address)}</p>
                          <span>{formatShippingDetails(order.shipping_address)}</span>
                        </section>
                        <label className={styles.orderNotes}>
                          <span>Order notes</span>
                          <textarea
                            disabled={disabled}
                            value={draft.notes}
                            onChange={(event) => updateDraft({ notes: event.target.value })}
                          />
                        </label>
                      </div>

                      <div className={styles.orderItems}>
                        {items.map((item) => (
                          <article key={item.id}>
                            <img
                              src={assetPath(item.image)}
                              alt=""
                              width={72}
                              height={72}
                              loading="lazy"
                            />
                            <div>
                              <strong>{item.name}</strong>
                              <span>
                                {item.variant_label} / {item.size} / Qty {item.quantity}
                              </span>
                            </div>
                            <p>${formatPrice(Number(item.price) * item.quantity)}</p>
                          </article>
                        ))}
                      </div>

                      <div className={styles.orderDetailActions}>
                        <button
                          className={styles.tableButton}
                          disabled={disabled}
                          type="button"
                          onClick={() => onOrderSave(order)}
                        >
                          Save order
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductCreateForm({
  disabled,
  draft,
  onChange,
  onCreate,
  onImageUpload,
}: {
  disabled: boolean;
  draft: NewProductDraft;
  onChange: Dispatch<SetStateAction<NewProductDraft>>;
  onCreate: () => void;
  onImageUpload: (
    file: File,
    field: "detailHeroImage" | "image",
    onUploaded: (publicUrl: string) => void,
  ) => void;
}) {
  return (
    <section className={styles.productForm} aria-labelledby="new-product-title">
      <div className={styles.productFormHeader}>
        <div>
          <h3 id="new-product-title">Add product</h3>
          <p>Create a live catalog item without touching code.</p>
        </div>
        <button type="button" disabled={disabled} onClick={onCreate}>
          Add Product
        </button>
      </div>

      <div className={styles.productFormGrid}>
        <ProductTextField
          disabled={disabled}
          label="Product ID"
          value={draft.productId}
          onChange={(value) =>
            onChange((current) => ({ ...current, productId: normalizeProductId(value) }))
          }
        />
        <ProductTextField
          disabled={disabled}
          label="Name"
          value={draft.name}
          onChange={(value) => onChange((current) => ({ ...current, name: value }))}
        />
        <label>
          <span>Category</span>
          <select
            disabled={disabled}
            value={draft.category}
            onChange={(event) =>
              onChange((current) => ({ ...current, category: event.target.value }))
            }
          >
            {productCategoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <ProductTextField
          disabled={disabled}
          label="Price"
          type="number"
          value={draft.price}
          onChange={(value) => onChange((current) => ({ ...current, price: value }))}
        />
        <ProductImageField
          disabled={disabled}
          label="Main image"
          value={draft.image}
          onChange={(value) => onChange((current) => ({ ...current, image: value }))}
          onUpload={(file) =>
            onImageUpload(file, "image", (publicUrl) =>
              onChange((current) => ({ ...current, image: publicUrl })),
            )
          }
        />
        <ProductTextField
          disabled={disabled}
          label="Alt text"
          value={draft.alt}
          onChange={(value) => onChange((current) => ({ ...current, alt: value }))}
        />
        <ProductTextField
          disabled={disabled}
          label="Color"
          value={draft.color}
          onChange={(value) => onChange((current) => ({ ...current, color: value }))}
        />
        <ProductTextField
          disabled={disabled}
          label="Material"
          value={draft.material}
          onChange={(value) => onChange((current) => ({ ...current, material: value }))}
        />
        <ProductTextField
          disabled={disabled}
          label="Collection"
          value={draft.collection}
          onChange={(value) => onChange((current) => ({ ...current, collection: value }))}
        />
        <ProductTextField
          disabled={disabled}
          label="Stock"
          type="number"
          value={draft.inventoryQuantity}
          onChange={(value) =>
            onChange((current) => ({ ...current, inventoryQuantity: value }))
          }
        />
        <ProductTextField
          disabled={disabled}
          label="Low stock"
          type="number"
          value={draft.lowStockThreshold}
          onChange={(value) =>
            onChange((current) => ({ ...current, lowStockThreshold: value }))
          }
        />
        <label>
          <span>Status</span>
          <select
            disabled={disabled}
            value={draft.status}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                status: event.target.value as CatalogProductStatus,
              }))
            }
          >
            {catalogStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.productWideField}>
          <span>Description</span>
          <textarea
            disabled={disabled}
            value={draft.description}
            onChange={(event) =>
              onChange((current) => ({ ...current, description: event.target.value }))
            }
          />
        </label>
        <ProductTextField
          disabled={disabled}
          label="Tags"
          value={draft.tags}
          wrapperClassName={styles.productWideField}
          onChange={(value) => onChange((current) => ({ ...current, tags: value }))}
        />
        <ProductImageField
          disabled={disabled}
          label="Detail hero image"
          value={draft.detailHeroImage}
          wrapperClassName={styles.productWideField}
          onChange={(value) =>
            onChange((current) => ({ ...current, detailHeroImage: value }))
          }
          onUpload={(file) =>
            onImageUpload(file, "detailHeroImage", (publicUrl) =>
              onChange((current) => ({ ...current, detailHeroImage: publicUrl })),
            )
          }
        />
        <ProductTextField
          disabled={disabled}
          label="Detail hero alt"
          value={draft.detailHeroAlt}
          wrapperClassName={styles.productWideField}
          onChange={(value) =>
            onChange((current) => ({ ...current, detailHeroAlt: value }))
          }
        />
      </div>

      <div className={styles.productFlags}>
        <label>
          <input
            checked={draft.isNew}
            disabled={disabled}
            type="checkbox"
            onChange={(event) =>
              onChange((current) => ({ ...current, isNew: event.target.checked }))
            }
          />
          New
        </label>
        <label>
          <input
            checked={draft.featured}
            disabled={disabled}
            type="checkbox"
            onChange={(event) =>
              onChange((current) => ({ ...current, featured: event.target.checked }))
            }
          />
          Featured
        </label>
        <label>
          <input
            checked={draft.allowBackorder}
            disabled={disabled}
            type="checkbox"
            onChange={(event) =>
              onChange((current) => ({ ...current, allowBackorder: event.target.checked }))
            }
          />
          Allow backorder
        </label>
      </div>
    </section>
  );
}

function ProductTextField({
  disabled,
  label,
  onChange,
  type = "text",
  value,
  wrapperClassName,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  type?: "number" | "text";
  value: string;
  wrapperClassName?: string;
}) {
  return (
    <label className={wrapperClassName}>
      <span>{label}</span>
      <input
        disabled={disabled}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "0.01" : undefined}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ProductImageField({
  disabled,
  label,
  onChange,
  onUpload,
  value,
  wrapperClassName,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
  value: string;
  wrapperClassName?: string;
}) {
  return (
    <label className={wrapperClassName}>
      <span>{label}</span>
      <div className={styles.imageInputGroup}>
        <input
          disabled={disabled}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          accept="image/gif,image/jpeg,image/png,image/webp"
          disabled={disabled}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.currentTarget.value = "";
            if (file) onUpload(file);
          }}
        />
      </div>
      {value ? (
        <img
          className={styles.imagePreview}
          src={assetPath(value)}
          alt=""
          width={104}
          height={104}
          loading="lazy"
        />
      ) : null}
    </label>
  );
}

function ProductTable({
  disabled,
  drafts,
  onDraftChange,
  onDelete,
  onImageUpload,
  onPatch,
  onProductSave,
  products,
}: {
  disabled: boolean;
  drafts: Record<string, ProductDraft>;
  onDraftChange: Dispatch<SetStateAction<Record<string, ProductDraft>>>;
  onDelete: (productId: string, name: string) => void;
  onImageUpload: (
    productId: string,
    file: File,
    field: "detailHeroImage" | "image",
    onUploaded: (publicUrl: string) => void,
  ) => void;
  onPatch: (
    productId: string,
    patch: {
      allow_backorder?: boolean;
      featured?: boolean;
      status?: CatalogProductStatus;
    },
  ) => void;
  onProductSave: (productId: string) => void;
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
            <th>Price</th>
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
            const draft = drafts[product.product_id] ?? makeProductDraft(product);
            const isLinked = storefrontProductIds.has(product.product_id);
            const updateDraft = (patch: Partial<ProductDraft>) =>
              onDraftChange((current) => ({
                ...current,
                [product.product_id]: {
                  ...draft,
                  ...patch,
                },
              }));

            return (
              <Fragment key={product.product_id}>
                <tr>
                  <td>
                    <div className={styles.productCell}>
                      <img
                        src={assetPath(draft.image || product.image)}
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
                        {!isLinked ? (
                          <span className={styles.warning}>Dynamic product route</span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <input
                      aria-label={`Price for ${product.name}`}
                      disabled={disabled}
                      min={0}
                      step="0.01"
                      type="number"
                      value={draft.price}
                      onChange={(event) => updateDraft({ price: event.target.value })}
                    />
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
                        updateDraft({ inventoryQuantity: event.target.value })
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
                        updateDraft({ lowStockThreshold: event.target.value })
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
                    <div className={styles.actionStack}>
                      <button
                        className={styles.tableButton}
                        disabled={disabled}
                        type="button"
                        onClick={() => onProductSave(product.product_id)}
                      >
                        Save
                      </button>
                      <button
                        className={styles.dangerButton}
                        disabled={disabled}
                        type="button"
                        onClick={() => onDelete(product.product_id, product.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className={styles.detailEditRow}>
                  <td colSpan={8}>
                    <div className={styles.productEditGrid}>
                      <ProductTextField
                        disabled={disabled}
                        label="Name"
                        value={draft.name}
                        onChange={(value) => updateDraft({ name: value })}
                      />
                      <label>
                        <span>Category</span>
                        <select
                          disabled={disabled}
                          value={draft.category}
                          onChange={(event) => updateDraft({ category: event.target.value })}
                        >
                          {productCategoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>
                      <ProductImageField
                        disabled={disabled}
                        label="Main image"
                        value={draft.image}
                        onChange={(value) => updateDraft({ image: value })}
                        onUpload={(file) =>
                          onImageUpload(product.product_id, file, "image", (publicUrl) =>
                            updateDraft({ image: publicUrl }),
                          )
                        }
                      />
                      <ProductTextField
                        disabled={disabled}
                        label="Alt text"
                        value={draft.alt}
                        onChange={(value) => updateDraft({ alt: value })}
                      />
                      <ProductTextField
                        disabled={disabled}
                        label="Color"
                        value={draft.color}
                        onChange={(value) => updateDraft({ color: value })}
                      />
                      <ProductTextField
                        disabled={disabled}
                        label="Material"
                        value={draft.material}
                        onChange={(value) => updateDraft({ material: value })}
                      />
                      <ProductTextField
                        disabled={disabled}
                        label="Collection"
                        value={draft.collection}
                        onChange={(value) => updateDraft({ collection: value })}
                      />
                      <ProductTextField
                        disabled={disabled}
                        label="Tags"
                        value={draft.tags}
                        onChange={(value) => updateDraft({ tags: value })}
                      />
                      <ProductImageField
                        disabled={disabled}
                        label="Detail hero image"
                        value={draft.detailHeroImage}
                        onChange={(value) => updateDraft({ detailHeroImage: value })}
                        onUpload={(file) =>
                          onImageUpload(
                            product.product_id,
                            file,
                            "detailHeroImage",
                            (publicUrl) => updateDraft({ detailHeroImage: publicUrl }),
                          )
                        }
                      />
                      <ProductTextField
                        disabled={disabled}
                        label="Detail hero alt"
                        value={draft.detailHeroAlt}
                        onChange={(value) => updateDraft({ detailHeroAlt: value })}
                      />
                      <label className={styles.productWideField}>
                        <span>Description</span>
                        <textarea
                          disabled={disabled}
                          value={draft.description}
                          onChange={(event) =>
                            updateDraft({ description: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Variants JSON</span>
                        <textarea
                          disabled={disabled}
                          value={draft.variantsJson}
                          onChange={(event) =>
                            updateDraft({ variantsJson: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Detail tabs JSON</span>
                        <textarea
                          disabled={disabled}
                          value={draft.detailTabsJson}
                          onChange={(event) =>
                            updateDraft({ detailTabsJson: event.target.value })
                          }
                        />
                      </label>
                      <label className={styles.switchLabel}>
                        <input
                          checked={draft.isNew}
                          disabled={disabled}
                          type="checkbox"
                          onChange={(event) => updateDraft({ isNew: event.target.checked })}
                        />
                        New product
                      </label>
                    </div>
                  </td>
                </tr>
              </Fragment>
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

function makeOrderDrafts(orders: Order[]) {
  return Object.fromEntries(orders.map((order) => [order.id, makeOrderDraft(order)]));
}

function makeOrderDraft(order: Order): OrderDraft {
  return {
    notes: order.notes ?? "",
    status: order.status as OrderStatus,
  };
}

function makeProductDrafts(products: AdminSnapshot["catalogProducts"]) {
  return Object.fromEntries(
    products.map((product) => [product.product_id, makeProductDraft(product)]),
  );
}

function makeProductDraft(product: AdminSnapshot["catalogProducts"][number]): ProductDraft {
  const fallback = getProductById(product.product_id);

  return {
    alt: product.alt ?? fallback?.alt ?? product.name,
    category: product.category || fallback?.category || productCategoryOptions[0],
    collection: product.collection || fallback?.collection || "Spring 26",
    color: product.color ?? fallback?.color ?? "",
    description: product.description ?? fallback?.description ?? "",
    detailHeroAlt: product.detail_hero_alt ?? fallback?.detailHeroAlt ?? "",
    detailHeroImage: product.detail_hero_image ?? fallback?.detailHeroImage ?? "",
    detailTabsJson: stringifyJson(product.detail_tabs ?? fallback?.detailTabs),
    image: product.image,
    inventoryQuantity: String(product.inventory_quantity),
    isNew: product.is_new || Boolean(fallback?.isNew),
    lowStockThreshold: String(product.low_stock_threshold),
    material: product.material ?? fallback?.material ?? "",
    name: product.name,
    price: String(Number(product.price)),
    tags: product.tags.length > 0 ? product.tags.join(", ") : fallback?.tags.join(", ") ?? "",
    variantsJson: stringifyJson(product.variants ?? fallback?.variants),
  };
}

function makeEmptyProductDraft(): NewProductDraft {
  return {
    allowBackorder: false,
    alt: "",
    category: productCategoryOptions[0],
    collection: "Spring 26",
    color: "",
    description: "",
    detailHeroAlt: "",
    detailHeroImage: "",
    detailTabsJson: "",
    featured: false,
    image: "",
    inventoryQuantity: "12",
    isNew: true,
    lowStockThreshold: "3",
    material: "",
    name: "",
    price: "",
    productId: "",
    status: "draft",
    tags: "",
    variantsJson: "",
  };
}

function buildProductPayloadFromDraft(draft: ProductDraft) {
  const name = draft.name.trim();
  const image = draft.image.trim();
  const category = draft.category.trim();
  const collection = draft.collection.trim() || "Spring 26";
  const description = draft.description.trim();
  const price = Number(draft.price);
  const inventoryQuantity = Number(draft.inventoryQuantity);
  const lowStockThreshold = Number(draft.lowStockThreshold);

  if (!name || !category || !image || !description) {
    return { error: "Name, category, image, and description are required." };
  }

  if (!productCategoryOptions.includes(category as (typeof productCategoryOptions)[number])) {
    return { error: "Choose a valid product category." };
  }

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(inventoryQuantity) ||
    inventoryQuantity < 0 ||
    !Number.isInteger(lowStockThreshold) ||
    lowStockThreshold < 0
  ) {
    return { error: "Price, stock, and threshold must be valid numbers greater than or equal to 0." };
  }

  const variants = parseJsonDraft(draft.variantsJson, "Variants JSON");
  if ("error" in variants) return variants;

  const detailTabs = parseJsonDraft(draft.detailTabsJson, "Detail tabs JSON");
  if ("error" in detailTabs) return detailTabs;

  return {
    value: {
      alt: draft.alt.trim() || name,
      category,
      collection,
      color: nullIfBlank(draft.color),
      description,
      detail_hero_alt: nullIfBlank(draft.detailHeroAlt),
      detail_hero_image: nullIfBlank(draft.detailHeroImage),
      detail_tabs: detailTabs.value,
      image,
      inventory_quantity: inventoryQuantity,
      is_new: draft.isNew,
      low_stock_threshold: lowStockThreshold,
      material: nullIfBlank(draft.material),
      name,
      price,
      tags: parseTags(draft.tags),
      variants: variants.value,
    },
  };
}

function normalizeProductId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function nullIfBlank(value: string) {
  const nextValue = value.trim();
  return nextValue.length > 0 ? nextValue : null;
}

function parseJsonDraft(value: string, label: string): { value: Json | null } | { error: string } {
  const trimmedValue = value.trim();
  if (!trimmedValue) return { value: null };

  try {
    return { value: JSON.parse(trimmedValue) as Json };
  } catch {
    return { error: `${label} is not valid JSON.` };
  }
}

function stringifyJson(value: unknown) {
  if (!value || (Array.isArray(value) && value.length === 0)) return "";
  return JSON.stringify(value, null, 2);
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

function formatShippingDetails(address: Json) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return "No structured shipping details.";
  }

  return Object.entries(address as Record<string, Json>)
    .map(([key, value]) => {
      if (typeof value !== "string" || value.length === 0) return "";
      return `${formatAddressKey(key)}: ${value}`;
    })
    .filter(Boolean)
    .join(" / ");
}

function formatAddressKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}
