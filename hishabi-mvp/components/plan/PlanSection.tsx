"use client";

type PlanSectionProps = {
  planSellerId: string;
  setPlanSellerId: (value: string) => void;
  sellerPlanData: any;
  setSellerPlanData: (value: any) => void;
  planLoading: boolean;
  planUpdating: boolean;
  fetchPlanForSeller: (sellerId?: string) => Promise<void>;
  handleChangeSellerPlan: (plan: string) => Promise<void>;
  isPlanSellerLoaded: () => boolean;
  getImageLimitByPlan: (plan: string) => number;
  PLAN_OPTIONS: any[];
  shortId: (value: string) => string;
  renderCopyButton: (value: string, label: string) => React.ReactNode;
};

export default function PlanSection({
  planSellerId,
  setPlanSellerId,
  sellerPlanData,
  setSellerPlanData,
  planLoading,
  planUpdating,
  fetchPlanForSeller,
  handleChangeSellerPlan,
  isPlanSellerLoaded,
  getImageLimitByPlan,
  PLAN_OPTIONS,
  shortId,
  renderCopyButton,
}: PlanSectionProps) {
  return (
    <>
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Plan Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Seller ID is synced from Global Seller ID. You can still change
                it manually here.
              </p>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <input
                  value={planSellerId}
                  onChange={(event) => {
                    setPlanSellerId(event.target.value);
                    setSellerPlanData(null);
                  }}
                  placeholder="Paste seller ID to check or change plan"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={() => fetchPlanForSeller()}
                  disabled={planLoading}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 md:w-auto"
                >
                  {planLoading ? "Loading..." : "Load Plan"}
                </button>
              </div>
            </section>

            {sellerPlanData && (
              <section className="mb-8 grid gap-4 md:grid-cols-5">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Current Plan</p>
                  <h2 className="mt-2 text-3xl font-bold capitalize">
                    {sellerPlanData.plan}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Product Limit</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {sellerPlanData.product_limit}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Current Products</p>
                  <h2 className="mt-2 text-3xl font-bold">
                    {sellerPlanData.current_product_count}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Remaining Products</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {sellerPlanData.remaining_products}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Image Limit</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {getImageLimitByPlan(sellerPlanData.plan)}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">per product</p>
                </div>
              </section>
            )}

            {sellerPlanData && (
              <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                  Seller Info
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Seller ID
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="break-all font-mono text-sm text-slate-700">
                        {shortId(sellerPlanData.seller_id)}
                      </p>
                      {renderCopyButton(sellerPlanData.seller_id, "Seller ID")}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Name
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {sellerPlanData.name || "Not added"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Phone
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {sellerPlanData.phone || "Not added"}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Upgrade Options
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Change seller plan for MVP/admin testing. No payment will be
                  charged.
                </p>

                {!isPlanSellerLoaded() && (
                  <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-800 ring-1 ring-yellow-100">
                    Load a valid seller first. Plan buttons are disabled until the seller exists.
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {PLAN_OPTIONS.map((plan) => {
                  const isCurrentPlan = sellerPlanData?.plan === plan.id;

                  return (
                    <article
                      key={plan.id}
                      className={`rounded-2xl border p-5 shadow-sm ${
                        isCurrentPlan
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {plan.name}
                          </h3>

                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            {plan.price}
                          </p>
                        </div>

                        {isCurrentPlan && (
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="mt-5 space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-800">
                            Product limit:
                          </span>{" "}
                          {plan.productLimit}
                        </p>

                        <p>
                          <span className="font-semibold text-slate-800">
                            Image limit:
                          </span>{" "}
                          {plan.imageLimit}
                        </p>

                        <p className="pt-2 text-slate-500">
                          {plan.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleChangeSellerPlan(plan.id)}
                        disabled={planUpdating || !isPlanSellerLoaded()}
                        className={`mt-5 w-full rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          isCurrentPlan
                            ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {planUpdating
                          ? "Updating..."
                          : isCurrentPlan
                          ? "Current Plan"
                          : `Change to ${plan.name}`}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
  );
}
