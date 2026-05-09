"use client";

type ProductImage = {
  id: string;
  product_id: string;
  seller_id: string;
  image_url: string;
  storage_path?: string | null;
};

type ProductsSectionProps = {
  products: any[];
  productImagesByProductId: Record<string, ProductImage[]>;
  productImagesLoadingByProductId: Record<string, boolean>;
  handleDeleteProductImage: (
    imageId: string,
    productId: string,
    productName: string
  ) => Promise<void>;
  activeGlobalSellerId: string;
  productsLoading: boolean;
  showProductForm: boolean;
  setShowProductForm: (value: boolean) => void;
  productSubmitting: boolean;
  filterSellerId: string;
  setFilterSellerId: (value: string) => void;
  productSearchQuery: string;
  setProductSearchQuery: (value: string) => void;
  sellerId: string;
  setSellerId: (value: string) => void;
  productName: string;
  setProductName: (value: string) => void;
  productPrice: string;
  setProductPrice: (value: string) => void;
  selectedImages: File[];
  setSelectedImages: (value: File[]) => void;
  handleImageChange: (event: any) => void;
  removeSelectedImage: (index: number) => void;
  sellerPlan: string;
  imageLimit: number;
  editingProductId: string | null;
  editProductName: string;
  setEditProductName: (value: string) => void;
  editProductPrice: string;
  setEditProductPrice: (value: string) => void;
  editProductSubmitting: boolean;
  getVisibleProducts: () => any[];
  fetchProducts: (sellerId?: string) => Promise<void>;
  fetchSellerPlan: (sellerId: string) => Promise<void>;
  handleAddProduct: (event: any) => Promise<void>;
  handleDeleteProduct: (productId: string, productName: string) => Promise<void>;
  handleEditProduct: (event: any, productId: string) => Promise<void>;
  cancelProductEdit: () => void;
  openEditProductForm: (product: any) => void;
  handleOpenProductForm: () => void;
  renderCopyButton: (value: string, label: string) => React.ReactNode;
  getImageLimitByPlan: (plan: string) => number;
  formatTaka: (amount: number | null | undefined) => string;
  shortId: (value: string) => string;
};

export default function ProductsSection({
  products,
  productImagesByProductId,
  productImagesLoadingByProductId,
  handleDeleteProductImage,
  activeGlobalSellerId,
  productsLoading,
  showProductForm,
  setShowProductForm,
  productSubmitting,
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
  handleImageChange,
  removeSelectedImage,
  sellerPlan,
  imageLimit,
  editingProductId,
  editProductName,
  setEditProductName,
  editProductPrice,
  setEditProductPrice,
  editProductSubmitting,
  getVisibleProducts,
  fetchProducts,
  fetchSellerPlan,
  handleAddProduct,
  handleDeleteProduct,
  handleEditProduct,
  cancelProductEdit,
  openEditProductForm,
  handleOpenProductForm,
  renderCopyButton,
  getImageLimitByPlan,
  formatTaka,
  shortId,
}: ProductsSectionProps) {
  return (
    <>
            {showProductForm && (
              <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Add New Product</h2>

                {activeGlobalSellerId && (
                  <p className="mt-1 text-sm text-slate-500">
                    Seller ID auto-filled from Global Seller ID.
                  </p>
                )}

                <form onSubmit={handleAddProduct} className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Seller ID
                    </label>

                    <input
                      value={sellerId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSellerId(value);
                        fetchSellerPlan(value);
                      }}
                      placeholder="Paste seller ID here"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Product Name
                    </label>

                    <input
                      value={productName}
                      onChange={(event) => setProductName(event.target.value)}
                      placeholder="Cotton Kurti"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Price
                    </label>

                    <input
                      value={productPrice}
                      onChange={(event) => setProductPrice(event.target.value)}
                      placeholder="500"
                      type="number"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Product Images
                    </label>

                    <p className="mb-3 text-sm text-slate-500">
                      Current plan:{" "}
                      <span className="font-semibold">{sellerPlan}</span>.
                      Image limit:{" "}
                      <span className="font-semibold">{imageLimit}</span> per
                      product.
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                    />

                    {selectedImages.length > 0 && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">
                          Selected {selectedImages.length} image
                          {selectedImages.length > 1 ? "s" : ""}
                        </p>

                        <div className="mt-3 space-y-2">
                          {selectedImages.map((file, index) => (
                            <div
                              key={`${file.name}-${file.lastModified}`}
                              className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm"
                            >
                              <div>
                                <p className="font-medium text-slate-700">
                                  {file.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeSelectedImage(index)}
                                className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-600 transition hover:bg-red-100"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <button
                      type="submit"
                      disabled={productSubmitting}
                      className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 md:w-auto"
                    >
                      {productSubmitting ? "Adding..." : "Save Product"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
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
                Find Products
              </h2>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  value={filterSellerId}
                  onChange={(event) => setFilterSellerId(event.target.value)}
                  placeholder="Paste seller ID to filter products"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={() => fetchProducts(filterSellerId)}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 md:w-auto"
                >
                  Apply Filter
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterSellerId("");
                    fetchProducts("");
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
                    Search Product Name
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Search by product name, price, product ID, seller ID, or image URL.
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-600">
                  Showing {getVisibleProducts().length} of {products.length} products
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  value={productSearchQuery}
                  onChange={(event) => setProductSearchQuery(event.target.value)}
                  placeholder="Search products by name, price, product ID, seller ID..."
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={() => setProductSearchQuery("")}
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:w-auto"
                >
                  Clear Search
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Products</h2>

              {productsLoading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-700">
                    Loading products...
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Please wait while Hishabi loads your product list.
                  </p>
                </div>
              )}

              {!productsLoading && getVisibleProducts().length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-sm">
                  <p className="text-base font-bold text-slate-800">
                    {productSearchQuery.trim()
                      ? "No matching products found"
                      : "No products yet"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {productSearchQuery.trim()
                      ? "Try a different search term or clear the filter."
                      : "Add your first product to start building your seller catalog."}
                  </p>
                </div>
              )}

              {!productsLoading && getVisibleProducts().length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getVisibleProducts().map((product) => {
                    const productImages = productImagesByProductId[product.id];
                    const isImagesLoaded = Array.isArray(productImages);
                    const visibleImages = productImages || [];
                    const primaryImageUrl = isImagesLoaded
                      ? visibleImages[0]?.image_url
                      : product.image_url;
                    const isImagesLoading =
                      productImagesLoadingByProductId[product.id];

                    return (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="h-48 bg-slate-100">
                        {primaryImageUrl && primaryImageUrl.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryImageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            No product image
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        {editingProductId === product.id ? (
                          <form
                            onSubmit={(event) =>
                              handleEditProduct(event, product.id)
                            }
                            className="space-y-3"
                          >
                            <input
                              value={editProductName}
                              onChange={(event) =>
                                setEditProductName(event.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                              autoFocus
                            />

                            <input
                              value={editProductPrice}
                              onChange={(event) =>
                                setEditProductPrice(event.target.value)
                              }
                              type="number"
                              min="1"
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                            />

                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={editProductSubmitting}
                                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                              >
                                {editProductSubmitting ? "Saving..." : "Save"}
                              </button>

                              <button
                                type="button"
                                onClick={cancelProductEdit}
                                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-slate-900">
                              {product.name}
                            </h3>

                            <p className="mt-1 text-xl font-bold text-slate-950">
                              {product.price} BDT
                            </p>

                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="mb-3 flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-800">
                                  Product images
                                </p>
                                <p className="text-xs text-slate-500">
                                  {isImagesLoading
                                    ? "Loading..."
                                    : `${visibleImages.length} image${
                                        visibleImages.length === 1 ? "" : "s"
                                      }`}
                                </p>
                              </div>

                              {visibleImages.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                  {visibleImages.map((image) => (
                                    <div
                                      key={image.id}
                                      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                    >
                                      <div className="h-24 bg-slate-100">
                                        {image.image_url?.startsWith("http") && (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={image.image_url}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                          />
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteProductImage(
                                            image.id,
                                            product.id,
                                            product.name
                                          )
                                        }
                                        className="min-h-10 w-full px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                      >
                                        Delete image
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="rounded-lg bg-white p-3 text-sm text-slate-500">
                                  No extra images saved for this product yet.
                                </p>
                              )}
                            </div>

                            <div className="mt-4 space-y-2 text-xs text-slate-500">
                              <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2">
                                <span className="break-all">
                                  Product ID:{" "}
                                  <span className="font-mono">
                                    {shortId(product.id)}
                                  </span>
                                </span>
                                {renderCopyButton(product.id, "Product ID")}
                              </div>

                              <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2">
                                <span className="break-all">
                                  Seller ID:{" "}
                                  <span className="font-mono">
                                    {shortId(product.seller_id)}
                                  </span>
                                </span>
                                {renderCopyButton(product.seller_id, "Seller ID")}
                              </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEditProductForm(product)}
                                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteProduct(product.id, product.name)
                                }
                                className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
  );
}
