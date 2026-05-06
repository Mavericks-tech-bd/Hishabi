"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  image_url?: string | null;
  created_at?: string;
};

const API_BASE_URL = "http://127.0.0.1:8003";

function getImageLimitByPlan(plan: string) {
  if (plan === "free") {
    return 3;
  }

  return 10;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [sellerId, setSellerId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [sellerPlan, setSellerPlan] = useState("free");
  const [imageLimit, setImageLimit] = useState(3);

  async function fetchProducts() {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/products`);
      const result = await response.json();

      setProducts(result.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setMessage("Could not load products from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchSellerPlan(currentSellerId: string) {
    if (!currentSellerId) {
      setSellerPlan("free");
      setImageLimit(3);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/sellers/${currentSellerId}/plan`
      );
      const result = await response.json();

      if (!response.ok) {
        setSellerPlan("free");
        setImageLimit(3);
        return;
      }

      const plan = result.data?.plan || "free";
      const limit = getImageLimitByPlan(plan);

      setSellerPlan(plan);
      setImageLimit(limit);
    } catch (error) {
      console.error("Failed to fetch seller plan:", error);
      setSellerPlan("free");
      setImageLimit(3);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(event.target.files || []);

    if (newFiles.length === 0) {
      return;
    }

    const combinedFiles = [...selectedImages, ...newFiles];

    const uniqueFiles = combinedFiles.filter((file, index, self) => {
      return (
        index ===
        self.findIndex(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
        )
      );
    });

    if (uniqueFiles.length > imageLimit) {
      setMessage(
        `You cannot select more than ${imageLimit} images for one product. Your current plan is ${sellerPlan}.`
      );

      event.target.value = "";
      return;
    }

    setSelectedImages(uniqueFiles);
    setMessage("");
    event.target.value = "";
  }

  function removeSelectedImage(indexToRemove: number) {
    const updatedImages = selectedImages.filter(
      (_, index) => index !== indexToRemove
    );

    setSelectedImages(updatedImages);
    setMessage("");
  }

  async function uploadProductImages(productId: string) {
    if (selectedImages.length === 0) {
      return;
    }

    const formData = new FormData();

    selectedImages.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/images`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      if (result.detail?.message) {
        throw new Error(result.detail.message);
      }

      if (result.detail?.upgrade_message) {
        throw new Error(result.detail.upgrade_message);
      }

      if (typeof result.detail === "string") {
        throw new Error(result.detail);
      }

      throw new Error("Image upload failed.");
    }
  }

  async function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!sellerId || !name || !price) {
      setMessage("Seller ID, product name, and price are required.");
      return;
    }

    if (selectedImages.length > imageLimit) {
      setMessage(
        `Your ${sellerPlan} plan allows ${imageLimit} images per product. Please remove extra images.`
      );
      return;
    }

    try {
      setSubmitting(true);

      const productResponse = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_id: sellerId,
          name: name,
          price: Number(price),
          image_url: null,
        }),
      });

      const productResult = await productResponse.json();

      if (!productResponse.ok) {
        if (productResult.detail?.upgrade_message) {
          setMessage(productResult.detail.upgrade_message);
        } else if (productResult.detail?.message) {
          setMessage(productResult.detail.message);
        } else if (typeof productResult.detail === "string") {
          setMessage(productResult.detail);
        } else {
          setMessage("Failed to create product.");
        }

        return;
      }

      const newProduct = productResult.data?.[0];

      if (!newProduct?.id) {
        setMessage("Product created, but product ID was not returned.");
        return;
      }

      if (selectedImages.length > 0) {
        try {
          await uploadProductImages(newProduct.id);
        } catch (uploadError) {
          await fetch(`${API_BASE_URL}/products/${newProduct.id}`, {
            method: "DELETE",
          });

          throw uploadError;
        }
      }

      setMessage("Product added successfully.");
      setSellerId("");
      setName("");
      setPrice("");
      setSelectedImages([]);
      setSellerPlan("free");
      setImageLimit(3);
      setShowAddForm(false);

      await fetchProducts();
    } catch (error) {
      console.error("Failed to create product:", error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong while creating product.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProduct(productId: string, productName: string) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.detail) {
          setMessage(String(result.detail));
        } else {
          setMessage("Failed to delete product.");
        }

        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );

      setMessage("Product deleted successfully.");
    } catch (error) {
      console.error("Failed to delete product:", error);
      setMessage("Something went wrong while deleting product.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Hishabi MVP
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">
              Product Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Manage your seller products from one simple dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            {showAddForm ? "Close Form" : "+ Add Product"}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Products</p>
            <h2 className="mt-2 text-3xl font-bold">{products.length}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Backend Status</p>
            <h2 className="mt-2 text-lg font-semibold text-emerald-600">
              Connected
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Current Module</p>
            <h2 className="mt-2 text-lg font-semibold">Products</h2>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {message}
          </div>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add product details and upload product images. Backend will
                automatically create image URLs using Supabase Storage.
              </p>
            </div>

            <form
              onSubmit={handleAddProduct}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
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
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Cotton Kurti"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price
                </label>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="500"
                  type="number"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Product Images
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:bg-slate-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Your current plan: {sellerPlan}. Image limit: {imageLimit} per
                  product.
                </p>

                {selectedImages.length > 0 && (
                  <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-medium">
                        Selected {selectedImages.length} image
                        {selectedImages.length > 1 ? "s" : ""}
                      </p>

                      <p className="text-xs text-slate-500">
                        Click × to remove a wrong image
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {selectedImages.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800">
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
                            aria-label={`Remove ${file.name}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Adding..." : "Save Product"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Products</h2>
              <p className="text-sm text-slate-500">
                Products loaded from your FastAPI backend.
              </p>
            </div>
          </div>

          {loading && (
            <div className="rounded-xl bg-slate-100 p-6 text-center text-slate-600">
              Loading products...
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="rounded-xl bg-slate-100 p-6 text-center text-slate-600">
              No products found.
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {product.image_url &&
                    product.image_url.startsWith("http") ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-slate-400">
                        No product image
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold">{product.name}</h3>

                  <p className="mt-2 text-2xl font-bold">
                    {product.price} BDT
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <p>
                      <span className="font-medium text-slate-700">
                        Product ID:
                      </span>{" "}
                      {product.id.slice(0, 8)}...
                    </p>

                    <p>
                      <span className="font-medium text-slate-700">
                        Seller ID:
                      </span>{" "}
                      {product.seller_id.slice(0, 8)}...
                    </p>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}