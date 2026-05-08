"use client";

import type { ReactNode } from "react";

import type { SellerPlanData } from "@/components/HishabiDashboard";

type Props = {
  sellerHelperId: string;
  setSellerHelperId: (value: string) => void;
  sellerHelperLoading: boolean;
  sellerHelperData: SellerPlanData | null;
  globalSellerLoading: boolean;
  loadSellerHelper: () => Promise<void>;
  applySellerHelperAsGlobalSeller: () => Promise<void>;
  fetchPlanForSeller: (sellerId: string) => Promise<void>;
  setActiveSection: (section: any) => void;
  setPlanSellerId: (value: string) => void;
  renderCopyButton: (value: string, label: string) => ReactNode;
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
}: Props) {
  return (
    <>
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Seller Setup Helper</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste a seller ID to load seller plan, product limit, current
          product count, and apply this seller across the dashboard.
        </p>
        <div className="mt-5 flex flex-col gap-3 md:flex-row">
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
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sellerHelperLoading ? "Loading..." : "Load Seller"}
          </button>
          <button
            type="button"
            onClick={applySellerHelperAsGlobalSeller}
            disabled={sellerHelperLoading || globalSellerLoading}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Apply as Global Seller
          </button>
        </div>
        {sellerHelperId.trim() && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Entered seller ID:</span>
            <span className="font-mono font-semibold text-slate-700">
              {sellerHelperId.trim()}
            </span>
            {renderCopyButton(sellerHelperId.trim(), "Seller ID")}
          </div>
        )}
      </section>

      {!sellerHelperData && (
        <section className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          No seller loaded yet. Paste a seller ID and click Load Seller.
        </section>
      )}

      {sellerHelperData && (
        <>
          <section className="mb-8 grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Current Plan</p>
              <h2 className="mt-2 text-3xl font-bold capitalize">{sellerHelperData.plan}</h2>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Product Limit</p>
              <h2 className="mt-2 text-2xl font-bold">{sellerHelperData.product_limit}</h2>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Current Products</p>
              <h2 className="mt-2 text-3xl font-bold">{sellerHelperData.current_product_count}</h2>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Remaining Products</p>
              <h2 className="mt-2 text-2xl font-bold">{sellerHelperData.remaining_products}</h2>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Image Limit</p>
              <h2 className="mt-2 text-2xl font-bold">{getImageLimitByPlan(sellerHelperData.plan)}</h2>
              <p className="mt-1 text-xs text-slate-500">per product</p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Seller Information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Seller ID</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="break-all font-mono text-sm text-slate-700">
                    {sellerHelperData.seller_id}
                  </p>
                  {renderCopyButton(sellerHelperData.seller_id, "Seller ID")}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Name</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {sellerHelperData.name || "Not added"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Phone</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {sellerHelperData.phone || "Not added"}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={applySellerHelperAsGlobalSeller}
                disabled={globalSellerLoading}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {globalSellerLoading ? "Applying..." : "Apply This Seller Globally"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlanSellerId(sellerHelperData.seller_id);
                  setActiveSection("plan");
                  fetchPlanForSeller(sellerHelperData.seller_id);
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Open in Plan Section
              </button>
            </div>
          </section>
        </>
      )}
    </>
  );
}
