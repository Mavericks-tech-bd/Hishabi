"use client";

type DashboardSectionProps = {
  dashboardSellerId: string;
  setDashboardSellerId: (value: string) => void;
  dashboardLoading: boolean;
  dashboardSummary: any;
  fetchDashboardSummary: (sellerId?: string) => Promise<void>;
  formatTaka: (amount: number | null | undefined) => string;
};

export default function DashboardSection({
  dashboardSellerId,
  setDashboardSellerId,
  dashboardLoading,
  dashboardSummary,
  fetchDashboardSummary,
  formatTaka,
}: DashboardSectionProps) {
  return (
    <>
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Dashboard Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Seller ID is synced from Global Seller ID. You can still change
                it manually here.
              </p>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <input
                  value={dashboardSellerId}
                  onChange={(event) => setDashboardSellerId(event.target.value)}
                  placeholder="Paste seller ID to load dashboard summary"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={() => fetchDashboardSummary()}
                  disabled={dashboardLoading}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {dashboardLoading ? "Loading..." : "Load Summary"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDashboardSellerId("");
                    fetchDashboardSummary("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Show Overall
                </button>
              </div>
            </section>

            {dashboardLoading && (
              <section className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
                Loading dashboard summary...
              </section>
            )}

            {!dashboardLoading && !dashboardSummary && (
              <section className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
                No dashboard summary loaded yet.
              </section>
            )}

            {!dashboardLoading && dashboardSummary && (
              <section className="space-y-6">
                <section className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Products</p>
                    <h2 className="mt-2 text-3xl font-bold">
                      {dashboardSummary.total_products}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Customers</p>
                    <h2 className="mt-2 text-3xl font-bold">
                      {dashboardSummary.total_customers}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Orders</p>
                    <h2 className="mt-2 text-3xl font-bold">
                      {dashboardSummary.total_orders}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Sales</p>
                    <h2 className="mt-2 text-3xl font-bold">
                      {formatTaka(dashboardSummary.total_sales)}
                    </h2>
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Average Order Value</p>
                    <h2 className="mt-2 text-3xl font-bold">
                      {formatTaka(dashboardSummary.average_order_value)}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-yellow-50 p-5 shadow-sm ring-1 ring-yellow-100">
                    <p className="text-sm text-yellow-700">Pending Orders</p>
                    <h2 className="mt-2 text-3xl font-bold text-yellow-800">
                      {dashboardSummary.pending_orders}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
                    <p className="text-sm text-blue-700">Confirmed Orders</p>
                    <h2 className="mt-2 text-3xl font-bold text-blue-800">
                      {dashboardSummary.confirmed_orders}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-purple-50 p-5 shadow-sm ring-1 ring-purple-100">
                    <p className="text-sm text-purple-700">Shipped Orders</p>
                    <h2 className="mt-2 text-3xl font-bold text-purple-800">
                      {dashboardSummary.shipped_orders}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-green-50 p-5 shadow-sm ring-1 ring-green-100">
                    <p className="text-sm text-green-700">Delivered Orders</p>
                    <h2 className="mt-2 text-3xl font-bold text-green-800">
                      {dashboardSummary.delivered_orders}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-red-50 p-5 shadow-sm ring-1 ring-red-100">
                    <p className="text-sm text-red-700">Cancelled Orders</p>
                    <h2 className="mt-2 text-3xl font-bold text-red-800">
                      {dashboardSummary.cancelled_orders}
                    </h2>
                  </div>
                </section>
              </section>
            )}
          </>
  );
}
