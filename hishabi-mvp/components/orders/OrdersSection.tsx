"use client";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type SectionProps = {
  sectionProps: any;
};

export default function OrdersSection({ sectionProps }: SectionProps) {
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
            {showOrderForm && (
              <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Create New Order</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Global Seller ID auto-fills seller and loads dropdowns when
                  available.
                </p>

                <form onSubmit={handleAddOrder} className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Seller ID
                    </label>

                    <div className="flex flex-col gap-3 md:flex-row">
                      <input
                        value={orderSellerId}
                        onChange={(event) => {
                          const value = event.target.value;
                          setOrderSellerId(value);
                          setOrderCustomerId("");
                          setOrderProductId("");
                          setOrderAvailableCustomers([]);
                          setOrderAvailableProducts([]);
                        }}
                        placeholder="Paste seller ID"
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                      />

                      <button
                        type="button"
                        onClick={() => fetchOrderOptionsForSeller()}
                        disabled={orderOptionsLoading}
                        className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 md:w-auto"
                      >
                        {orderOptionsLoading
                          ? "Loading..."
                          : "Load Customers & Products"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Customer
                      </label>

                      <select
                        value={orderCustomerId}
                        onChange={(event) =>
                          setOrderCustomerId(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                      >
                        <option value="">Select customer</option>

                        {orderAvailableCustomers.map((customer: any) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}{" "}
                            {customer.phone ? `- ${customer.phone}` : ""}
                          </option>
                        ))}
                      </select>

                      {orderSellerId && orderAvailableCustomers.length === 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          No customers loaded yet. Click Load Customers &
                          Products.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Product
                      </label>

                      <select
                        value={orderProductId}
                        onChange={(event) =>
                          setOrderProductId(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                      >
                        <option value="">Select product</option>

                        {orderAvailableProducts.map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.price} BDT
                          </option>
                        ))}
                      </select>

                      {orderSellerId && orderAvailableProducts.length === 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          No products loaded yet. Click Load Customers &
                          Products.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <input
                      value={orderQuantity}
                      onChange={(event) =>
                        setOrderQuantity(event.target.value)
                      }
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    />

                    <select
                      value={orderStatus}
                      onChange={(event) =>
                        setOrderStatus(event.target.value as OrderStatus)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    >
                      {ORDER_STATUSES.map((status: any) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Total will be calculated by backend as product price ×
                    quantity.
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 md:w-auto"
                    >
                      {orderSubmitting ? "Creating..." : "Create Order"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
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
                Filter Orders by Seller
              </h2>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  value={filterOrderSellerId}
                  onChange={(event) =>
                    setFilterOrderSellerId(event.target.value)
                  }
                  placeholder="Paste seller ID to filter orders"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={() => fetchOrders(filterOrderSellerId)}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 md:w-auto"
                >
                  Apply Filter
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterOrderSellerId("");
                    setOrderStatusFilter("all");
                    fetchOrders("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:w-auto"
                >
                  Show All
                </button>

                <select
                  value={orderStatusFilter}
                  onChange={(event) =>
                    setOrderStatusFilter(event.target.value as OrderStatus | "all")
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-900"
                  aria-label="Filter by status"
                >
                  <option value="all">All statuses</option>
                  {ORDER_STATUSES.map((status: any) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {(orderDetail || orderDetailLoading) && (
              <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">Order Detail</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Detail data comes from backend order detail API.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOrderDetail(null)}
                    className="min-h-10 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                  >
                    Close
                  </button>
                </div>

                {orderDetailLoading && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Loading order detail...
                  </div>
                )}

                {!orderDetailLoading && orderDetail && (
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Order
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 text-sm text-slate-700">
                        <span className="break-all font-mono">
                          {shortId(orderDetail.order_id)}
                        </span>
                        {renderCopyButton(orderDetail.order_id, "Order ID")}
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        Status:{" "}
                        <span className="font-semibold">
                          {orderDetail.status}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        Quantity: {orderDetail.quantity}
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        Total:{" "}
                        <span className="font-semibold">
                          {formatTaka(orderDetail.total)}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Customer
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {orderDetail.customer?.name || "Not found"}
                      </p>

                      {orderDetail.customer?.id && (
                        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                          <span className="font-mono">
                            {shortId(orderDetail.customer.id)}
                          </span>
                          {renderCopyButton(
                            orderDetail.customer.id,
                            "Customer ID"
                          )}
                        </div>
                      )}

                      <p className="mt-2 text-sm text-slate-700">
                        Phone: {orderDetail.customer?.phone || "Not added"}
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        Address: {orderDetail.customer?.address || "Not added"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Product
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {orderDetail.product?.name || "Not found"}
                      </p>

                      {orderDetail.product?.id && (
                        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                          <span className="font-mono">
                            {shortId(orderDetail.product.id)}
                          </span>
                          {renderCopyButton(
                            orderDetail.product.id,
                            "Product ID"
                          )}
                        </div>
                      )}

                      <p className="mt-2 text-sm text-slate-700">
                        Price: {formatTaka(orderDetail.product?.price)}
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        Seller:{" "}
                        {orderDetail.seller?.name ||
                          orderDetail.seller?.id ||
                          "Not found"}
                      </p>

                      {orderDetail.seller?.id && (
                        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                          <span className="font-mono">
                            {shortId(orderDetail.seller.id)}
                          </span>
                          {renderCopyButton(orderDetail.seller.id, "Seller ID")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Orders</h2>

              {ordersLoading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-700">
                    Loading orders...
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Please wait while Hishabi loads your order list.
                  </p>
                </div>
              )}

              {!ordersLoading && getVisibleOrders().length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-sm">
                  <p className="text-base font-bold text-slate-800">
                    No orders found
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Create your first order after adding at least one customer and one product.
                  </p>
                </div>
              )}

              {!ordersLoading && getVisibleOrders().length > 0 && (
                <div className="space-y-4">
                  {getVisibleOrders().map((order: any) => (
                    <article
                      key={order.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      {editingOrderId === order.id ? (
                        <form
                          onSubmit={(event) =>
                            handleEditOrder(event, order.id)
                          }
                          className="space-y-4"
                        >
                          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>Editing order for seller:</span>
                              <span className="font-mono font-semibold">
                                {shortId(editOrderSellerId)}
                              </span>
                              {editOrderSellerId &&
                                renderCopyButton(editOrderSellerId, "Seller ID")}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                fetchEditOrderOptionsForSeller(
                                  editOrderSellerId
                                )
                              }
                              disabled={editOrderOptionsLoading}
                              className="mt-3 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 sm:w-auto"
                            >
                              {editOrderOptionsLoading
                                ? "Loading dropdowns..."
                                : "Reload Customer/Product Dropdowns"}
                            </button>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                Customer
                              </label>

                              <select
                                value={editOrderCustomerId}
                                onChange={(event) =>
                                  setEditOrderCustomerId(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                              >
                                <option value="">Select customer</option>

                                {editOrderAvailableCustomers.map((customer: any) => (
                                  <option key={customer.id} value={customer.id}>
                                    {customer.name}{" "}
                                    {customer.phone
                                      ? `- ${customer.phone}`
                                      : ""}
                                  </option>
                                ))}
                              </select>

                              {editOrderAvailableCustomers.length === 0 && (
                                <p className="mt-1 text-xs text-slate-500">
                                  No customers loaded. Click reload dropdowns.
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                Product
                              </label>

                              <select
                                value={editOrderProductId}
                                onChange={(event) =>
                                  setEditOrderProductId(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                              >
                                <option value="">Select product</option>

                                {editOrderAvailableProducts.map((product: any) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - {product.price} BDT
                                  </option>
                                ))}
                              </select>

                              {editOrderAvailableProducts.length === 0 && (
                                <p className="mt-1 text-xs text-slate-500">
                                  No products loaded. Click reload dropdowns.
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                Quantity
                              </label>

                              <input
                                value={editOrderQuantity}
                                onChange={(event) =>
                                  setEditOrderQuantity(event.target.value)
                                }
                                type="number"
                                min="1"
                                placeholder="Quantity"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                Status
                              </label>

                              <select
                                value={editOrderStatus}
                                onChange={(event) =>
                                  setEditOrderStatus(
                                    event.target.value as OrderStatus
                                  )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                              >
                                {ORDER_STATUSES.map((status: any) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                            If product or quantity changes, backend will
                            recalculate total.
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={editOrderSubmitting}
                              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                            >
                              {editOrderSubmitting ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              onClick={cancelOrderEdit}
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-900">
                                  Order #{shortId(order.id)}
                                </h3>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${getStatusBadgeClass(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </div>

                              <div className="mt-2 space-y-2 text-sm text-slate-600">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>Order ID:</span>
                                  <span className="font-mono">
                                    {shortId(order.id)}
                                  </span>
                                  {renderCopyButton(order.id, "Order ID")}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span>Seller ID:</span>
                                  <span className="font-mono">
                                    {shortId(order.seller_id)}
                                  </span>
                                  {renderCopyButton(order.seller_id, "Seller ID")}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span>Customer:</span>
                                  <span className="font-semibold">
                                    {getCustomerName(order.customer_id)}
                                  </span>
                                  {renderCopyButton(
                                    order.customer_id,
                                    "Customer ID"
                                  )}
                                </div>

                                <p className="text-sm text-slate-500">
                                  Customer phone: {getCustomerPhone(order.customer_id)}
                                </p>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span>Product:</span>
                                  <span className="font-semibold">
                                    {getProductName(order.product_id)}
                                  </span>
                                  {renderCopyButton(
                                    order.product_id,
                                    "Product ID"
                                  )}
                                </div>

                                <p className="text-sm text-slate-500">
                                  Product price: {formatTaka(getProductPrice(order.product_id))}
                                </p>

                                <p>Quantity: {order.quantity}</p>

                                <p>
                                  Total:{" "}
                                  <span className="font-bold text-slate-900">
                                    {formatTaka(order.total)}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="min-w-[180px]">
                              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                                Status
                              </label>

                              <select
                                value={order.status}
                                onChange={(event) =>
                                  handleQuickStatusUpdate(
                                    order,
                                    event.target.value as OrderStatus
                                  )
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-slate-900"
                              >
                                {ORDER_STATUSES.map((status: any) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => fetchOrderDetail(order.id)}
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              View Detail
                            </button>

                            <button
                              type="button"
                              onClick={() => openOrderEditForm(order)}
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
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
