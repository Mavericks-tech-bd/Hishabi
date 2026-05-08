"use client";

type SectionProps = {
  sectionProps: any;
};

export default function CustomersSection({ sectionProps }: SectionProps) {
  const {
    ORDER_STATUSES,
    PLAN_OPTIONS,
    getImageLimitByPlan,
    formatTaka,
    shortId,
    activeSection,
    setActiveSection,
    message,
    setMessage,
    globalSellerId,
    setGlobalSellerId,
    activeGlobalSellerId,
    setActiveGlobalSellerId,
    globalSellerLoading,
    setGlobalSellerLoading,
    sellerHelperId,
    setSellerHelperId,
    sellerHelperData,
    setSellerHelperData,
    sellerHelperLoading,
    setSellerHelperLoading,
    products,
    setProducts,
    productsLoading,
    setProductsLoading,
    showProductForm,
    setShowProductForm,
    productSubmitting,
    setProductSubmitting,
    filterSellerId,
    setFilterSellerId,
    productSearchQuery,
    setProductSearchQuery,
    sellerId,
    setSellerId,
    productName,
    setProductName,
    productPrice,
    setProductPrice,
    selectedImages,
    setSelectedImages,
    sellerPlan,
    setSellerPlan,
    imageLimit,
    setImageLimit,
    editingProductId,
    setEditingProductId,
    editProductName,
    setEditProductName,
    editProductPrice,
    setEditProductPrice,
    editProductSubmitting,
    setEditProductSubmitting,
    customers,
    setCustomers,
    customersLoading,
    setCustomersLoading,
    showCustomerForm,
    setShowCustomerForm,
    customerSubmitting,
    setCustomerSubmitting,
    filterCustomerSellerId,
    setFilterCustomerSellerId,
    customerSearchQuery,
    setCustomerSearchQuery,
    customerSellerId,
    setCustomerSellerId,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerAddress,
    setCustomerAddress,
    customerFacebookId,
    setCustomerFacebookId,
    customerWhatsappNumber,
    setCustomerWhatsappNumber,
    editingCustomerId,
    setEditingCustomerId,
    editCustomerName,
    setEditCustomerName,
    editCustomerPhone,
    setEditCustomerPhone,
    editCustomerAddress,
    setEditCustomerAddress,
    editCustomerFacebookId,
    setEditCustomerFacebookId,
    editCustomerWhatsappNumber,
    setEditCustomerWhatsappNumber,
    editCustomerSubmitting,
    setEditCustomerSubmitting,
    orders,
    setOrders,
    ordersLoading,
    setOrdersLoading,
    showOrderForm,
    setShowOrderForm,
    orderSubmitting,
    setOrderSubmitting,
    filterOrderSellerId,
    setFilterOrderSellerId,
    orderStatusFilter,
    setOrderStatusFilter,
    orderSellerId,
    setOrderSellerId,
    orderCustomerId,
    setOrderCustomerId,
    orderProductId,
    setOrderProductId,
    orderQuantity,
    setOrderQuantity,
    orderStatus,
    setOrderStatus,
    orderAvailableCustomers,
    setOrderAvailableCustomers,
    orderAvailableProducts,
    setOrderAvailableProducts,
    orderOptionsLoading,
    setOrderOptionsLoading,
    editingOrderId,
    setEditingOrderId,
    editOrderSellerId,
    setEditOrderSellerId,
    editOrderCustomerId,
    setEditOrderCustomerId,
    editOrderProductId,
    setEditOrderProductId,
    editOrderQuantity,
    setEditOrderQuantity,
    editOrderStatus,
    setEditOrderStatus,
    editOrderSubmitting,
    setEditOrderSubmitting,
    editOrderAvailableCustomers,
    setEditOrderAvailableCustomers,
    editOrderAvailableProducts,
    setEditOrderAvailableProducts,
    editOrderOptionsLoading,
    setEditOrderOptionsLoading,
    orderDetail,
    setOrderDetail,
    orderDetailLoading,
    setOrderDetailLoading,
    planSellerId,
    setPlanSellerId,
    sellerPlanData,
    setSellerPlanData,
    planLoading,
    setPlanLoading,
    planUpdating,
    setPlanUpdating,
    dashboardSellerId,
    setDashboardSellerId,
    dashboardSummary,
    setDashboardSummary,
    dashboardLoading,
    setDashboardLoading,
    safeJson,
    getApiErrorMessage,
    isValidPositiveNumber,
    copyText,
    renderCopyButton,
    fetchProducts,
    fetchCustomers,
    fetchOrders,
    fetchDashboardSummary,
    fetchSellerPlan,
    fetchPlanForSeller,
    fetchOrderOptionsForSeller,
    fetchEditOrderOptionsForSeller,
    loadSellerHelper,
    applySellerHelperAsGlobalSeller,
    validateSellerExistsForFrontend,
    applyGlobalSellerId,
    clearGlobalSellerId,
    syncFormsWithActiveGlobalSeller,
    handleOpenProductForm,
    handleOpenCustomerForm,
    handleOpenOrderForm,
    handleImageChange,
    removeSelectedImage,
    uploadProductImages,
    handleAddProduct,
    handleDeleteProduct,
    openEditProductForm,
    cancelProductEdit,
    handleEditProduct,
    resetCustomerForm,
    handleAddCustomer,
    handleDeleteCustomer,
    openCustomerEditForm,
    cancelCustomerEdit,
    handleEditCustomer,
    resetOrderForm,
    handleAddOrder,
    handleDeleteOrder,
    openOrderEditForm,
    cancelOrderEdit,
    handleEditOrder,
    handleQuickStatusUpdate,
    fetchOrderDetail,
    isPlanSellerLoaded,
    handleChangeSellerPlan,
    getVisibleProducts,
    getVisibleCustomers,
    getCustomerPhone,
    getProductPrice,
    getStatusBadgeClass,
    getVisibleOrders,
    getCustomerName,
    getProductName,
    selectTab,
  } = sectionProps;

  return (
    <>
            {showCustomerForm && (
              <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Add New Customer</h2>

                {activeGlobalSellerId && (
                  <p className="mt-1 text-sm text-slate-500">
                    Seller ID auto-filled from Global Seller ID.
                  </p>
                )}

                <form onSubmit={handleAddCustomer} className="mt-6 space-y-5">
                  <input
                    value={customerSellerId}
                    onChange={(event) => setCustomerSellerId(event.target.value)}
                    placeholder="Seller ID"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  />

                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Customer name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <input
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="Phone"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    />

                    <input
                      value={customerWhatsappNumber}
                      onChange={(event) =>
                        setCustomerWhatsappNumber(event.target.value)
                      }
                      placeholder="WhatsApp number"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    />
                  </div>

                  <textarea
                    value={customerAddress}
                    onChange={(event) => setCustomerAddress(event.target.value)}
                    placeholder="Address"
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  />

                  <input
                    value={customerFacebookId}
                    onChange={(event) =>
                      setCustomerFacebookId(event.target.value)
                    }
                    placeholder="Facebook ID"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  />

                  <div className="flex flex-col gap-3 md:flex-row">
                    <button
                      type="submit"
                      disabled={customerSubmitting}
                      className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 md:w-auto"
                    >
                      {customerSubmitting ? "Adding..." : "Save Customer"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCustomerForm(false)}
                      className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Filter Customers by Seller
              </h2>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  value={filterCustomerSellerId}
                  onChange={(event) =>
                    setFilterCustomerSellerId(event.target.value)
                  }
                  placeholder="Paste seller ID to filter customers"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={() => fetchCustomers(filterCustomerSellerId)}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 md:w-auto"
                >
                  Apply Filter
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterCustomerSellerId("");
                    fetchCustomers("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:w-auto"
                >
                  Show All
                </button>
              </div>
            </section>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Search Customers
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Search by name, phone, WhatsApp, Facebook ID, address, customer ID, or seller ID.
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-600">
                  Showing {getVisibleCustomers().length} of {customers.length}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  value={customerSearchQuery}
                  onChange={(event) => setCustomerSearchQuery(event.target.value)}
                  placeholder="Search customers by name, phone, Facebook, WhatsApp, address..."
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={() => setCustomerSearchQuery("")}
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:w-auto"
                >
                  Clear Search
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Customers</h2>

              {customersLoading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-700">
                    Loading customers...
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Please wait while Hishabi loads your customer list.
                  </p>
                </div>
              )}

              {!customersLoading && getVisibleCustomers().length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-sm">
                  <p className="text-base font-bold text-slate-800">
                    {customerSearchQuery.trim()
                      ? "No matching customers found"
                      : "No customers yet"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {customerSearchQuery.trim()
                      ? "Try a different search term or clear the filter."
                      : "Add your first customer so orders can be created faster."}
                  </p>
                </div>
              )}

              {!customersLoading && getVisibleCustomers().length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {getVisibleCustomers().map((customer: any) => (
                    <article
                      key={customer.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      {editingCustomerId === customer.id ? (
                        <form
                          onSubmit={(event) =>
                            handleEditCustomer(event, customer.id)
                          }
                          className="space-y-3"
                        >
                          <input
                            value={editCustomerName}
                            onChange={(event) =>
                              setEditCustomerName(event.target.value)
                            }
                            placeholder="Customer name"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                            autoFocus
                          />

                          <input
                            value={editCustomerPhone}
                            onChange={(event) =>
                              setEditCustomerPhone(event.target.value)
                            }
                            placeholder="Phone"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                          />

                          <input
                            value={editCustomerWhatsappNumber}
                            onChange={(event) =>
                              setEditCustomerWhatsappNumber(event.target.value)
                            }
                            placeholder="WhatsApp"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                          />

                          <textarea
                            value={editCustomerAddress}
                            onChange={(event) =>
                              setEditCustomerAddress(event.target.value)
                            }
                            placeholder="Address"
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                          />

                          <input
                            value={editCustomerFacebookId}
                            onChange={(event) =>
                              setEditCustomerFacebookId(event.target.value)
                            }
                            placeholder="Facebook ID"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                          />

                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={editCustomerSubmitting}
                              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                            >
                              {editCustomerSubmitting ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              onClick={cancelCustomerEdit}
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold text-slate-900">
                            {customer.name}
                          </h3>

                          <div className="mt-4 space-y-2 text-xs text-slate-500">
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2">
                              <span className="break-all">
                                Customer ID:{" "}
                                <span className="font-mono">
                                  {shortId(customer.id)}
                                </span>
                              </span>
                              {renderCopyButton(customer.id, "Customer ID")}
                            </div>

                            <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2">
                              <span className="break-all">
                                Seller ID:{" "}
                                <span className="font-mono">
                                  {shortId(customer.seller_id)}
                                </span>
                              </span>
                              {renderCopyButton(customer.seller_id, "Seller ID")}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold">Phone:</span>{" "}
                              {customer.phone || "Not added"}
                            </p>

                            <p>
                              <span className="font-semibold">WhatsApp:</span>{" "}
                              {customer.whatsapp_number || "Not added"}
                            </p>

                            <p>
                              <span className="font-semibold">Facebook:</span>{" "}
                              {customer.facebook_id || "Not added"}
                            </p>

                            <p>
                              <span className="font-semibold">Address:</span>{" "}
                              {customer.address || "Not added"}
                            </p>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => openCustomerEditForm(customer)}
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteCustomer(
                                  customer.id,
                                  customer.name
                                )
                              }
                              className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
  );
}
