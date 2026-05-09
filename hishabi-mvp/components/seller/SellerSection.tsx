"use client";

type SellerSectionProps = {
  sellerHelperId: string;
  setSellerHelperId: (value: string) => void;
  sellerHelperLoading: boolean;
  sellerHelperData: any;
  globalSellerLoading: boolean;
  loadSellerHelper: (sellerId?: string) => Promise<void>;
  applySellerHelperAsGlobalSeller: () => Promise<void>;
  fetchPlanForSeller: (sellerId?: string) => Promise<void>;
  setActiveSection: (section: any) => void;
  setPlanSellerId: (sellerId: string) => void;
  renderCopyButton: (value: string, label: string) => React.ReactNode;
  getImageLimitByPlan: (plan: string) => number;
};

export default function SellerSection({
  sellerHelperId,
  setSellerHelperId,
  sellerHelperLoading,
  sellerHelperData,
  globalSellerLoading,
  loadSellerHelper,
  applySellerHelperAsGlobalSeller,
  fetchPlanForSeller,
  setActiveSection,
  setPlanSellerId,
  renderCopyButton,
  getImageLimitByPlan,
}: SellerSectionProps) {
  return (
    <>
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Seller onboarding
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Start with one seller ID
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Hishabi uses a seller ID to keep each seller&apos;s products,
              customers, orders, plan, and dashboard summary separate. Paste the
              seller ID once, load the seller, then apply it across the full
              dashboard.
            </p>
          </div>

          {sellerHelperData && (
            <span className="w-fit rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold capitalize text-white">
              {sellerHelperData.plan || "free"} seller loaded
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Step 1</p>
            <p className="mt-1 text-sm text-slate-500">
              Paste a seller ID from your seller record.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Step 2</p>
            <p className="mt-1 text-sm text-slate-500">
              Load seller to check plan, product limit, and image limit.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Step 3</p>
            <p className="mt-1 text-sm text-slate-500">
              Apply globally so Products, Customers, Orders, and Plan auto-sync.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Seller ID
          </label>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={sellerHelperId}
              onChange={(event) => setSellerHelperId(event.target.value)}
              placeholder="Paste seller ID here"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />

            <button
              type="button"
              onClick={() => loadSellerHelper()}
              disabled={sellerHelperLoading}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {sellerHelperLoading ? "Loading..." : "Load Seller"}
            </button>

            <button
              type="button"
              onClick={applySellerHelperAsGlobalSeller}
              disabled={sellerHelperLoading || globalSellerLoading}
              className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {globalSellerLoading ? "Applying..." : "Use Across Dashboard"}
            </button>
          </div>

          {sellerHelperId.trim() && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Entered seller ID
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-700">
                    {sellerHelperId.trim()}
                  </p>
                </div>

                {renderCopyButton(sellerHelperId.trim(), "Seller ID")}
              </div>
            </div>
          )}
        </div>
      </section>

      {!sellerHelperData && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-bold text-slate-800">
            No seller loaded yet
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Paste a seller ID and tap Load Seller. After the seller loads, use
            it across the dashboard to manage that seller&apos;s products,
            customers, orders, and plan.
          </p>
        </section>
      )}

      {sellerHelperData && (
        <>
          <section className="mb-8 grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Current Plan</p>
              <h2 className="mt-2 text-3xl font-bold capitalize">
                {sellerHelperData.plan}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Product Limit</p>
              <h2 className="mt-2 text-2xl font-bold">
                {sellerHelperData.product_limit}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Current Products</p>
              <h2 className="mt-2 text-3xl font-bold">
                {sellerHelperData.current_product_count}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Remaining Products</p>
              <h2 className="mt-2 text-2xl font-bold">
                {sellerHelperData.remaining_products}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Image Limit</p>
              <h2 className="mt-2 text-2xl font-bold">
                {getImageLimitByPlan(sellerHelperData.plan)}
              </h2>
              <p className="mt-1 text-xs text-slate-500">per product</p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Seller Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This seller can now be used across all dashboard modules.
                </p>
              </div>

              <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
                Ready to use
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Seller ID
                </p>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="break-all font-mono text-sm text-slate-700">
                    {sellerHelperData.seller_id}
                  </p>
                  {renderCopyButton(sellerHelperData.seller_id, "Seller ID")}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Name
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {sellerHelperData.name || "Not added"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Phone
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {sellerHelperData.phone || "Not added"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">
                Recommended next step
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Apply this seller globally first. Then open Products, Customers,
                and Orders. New forms will use this seller automatically.
              </p>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={applySellerHelperAsGlobalSeller}
                  disabled={globalSellerLoading}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                >
                  {globalSellerLoading
                    ? "Applying..."
                    : "Use This Seller Across Dashboard"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlanSellerId(sellerHelperData.seller_id);
                    setActiveSection("plan");
                    fetchPlanForSeller(sellerHelperData.seller_id);
                  }}
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:w-auto"
                >
                  Open Plan Settings
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
