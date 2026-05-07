"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type Product = {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  image_url?: string | null;
};

type Customer = {
  id: string;
  seller_id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  facebook_id?: string | null;
  whatsapp_number?: string | null;
};

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type Order = {
  id: string;
  seller_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  total?: number | null;
  status: OrderStatus;
};

type OrderDetail = {
  order_id: string;
  status: OrderStatus;
  quantity: number;
  total?: number | null;
  customer?: Customer | null;
  product?: Product | null;
  seller?: {
    id?: string;
    name?: string | null;
    phone?: string | null;
    plan?: string | null;
  } | null;
};

type SellerPlanData = {
  seller_id: string;
  name?: string | null;
  phone?: string | null;
  plan: string;
  product_limit: number | "unlimited";
  current_product_count: number;
  remaining_products: number | "unlimited";
};

type DashboardSummary = {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_sales: number;
  pending_orders: number;
  delivered_orders: number;
};

type ActiveSection =
 | "dashboard" 
 | "seller"
 | "products"
 | "customers"
 | "orders" 
 | "plan";

const API_BASE_URL = "http://127.0.0.1:8003";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const PLAN_OPTIONS = [
  {
    id: "free",
    name: "Free",
    price: "0 taka",
    productLimit: "10 products",
    imageLimit: "3 images per product",
    description: "Good for testing the MVP with a small product catalog.",
  },
  {
    id: "starter",
    name: "Starter",
    price: "99 taka",
    productLimit: "50 products",
    imageLimit: "10 images per product",
    description: "Better for small sellers who need more products and images.",
  },
  {
    id: "max",
    name: "Max",
    price: "500 taka",
    productLimit: "Unlimited products",
    imageLimit: "10 images per product",
    description: "Best for sellers who want no product limit.",
  },
];

function getImageLimitByPlan(plan: string) {
  return plan === "free" ? 3 : 10;
}

function formatTaka(value?: number | null) {
  if (value === null || value === undefined) {
    return "Not calculated";
  }

  return `${value} BDT`;
}

function shortId(id?: string | null) {
  if (!id) {
    return "N/A";
  }

  if (id.length <= 12) {
    return id;
  }

  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

export default function HishabiDashboard() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("dashboard");
  const [message, setMessage] = useState("");

  // Global seller
  const [globalSellerId, setGlobalSellerId] = useState("");
  const [activeGlobalSellerId, setActiveGlobalSellerId] = useState("");
  const [globalSellerLoading, setGlobalSellerLoading] = useState(false);

  // Seller helper
  const [sellerHelperId, setSellerHelperId] = useState("");
  const [sellerHelperData, setSellerHelperData] = 
  useState<SellerPlanData | null>(null);
  const [sellerHelperLoading, setSellerHelperLoading] = useState(false);

  // Products

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [filterSellerId, setFilterSellerId] = useState("");

  const [sellerId, setSellerId] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [sellerPlan, setSellerPlan] = useState("free");
  const [imageLimit, setImageLimit] = useState(3);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductPrice, setEditProductPrice] = useState("");
  const [editProductSubmitting, setEditProductSubmitting] = useState(false);

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerSubmitting, setCustomerSubmitting] = useState(false);
  const [filterCustomerSellerId, setFilterCustomerSellerId] = useState("");

  const [customerSellerId, setCustomerSellerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerFacebookId, setCustomerFacebookId] = useState("");
  const [customerWhatsappNumber, setCustomerWhatsappNumber] = useState("");

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null
  );
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editCustomerAddress, setEditCustomerAddress] = useState("");
  const [editCustomerFacebookId, setEditCustomerFacebookId] = useState("");
  const [editCustomerWhatsappNumber, setEditCustomerWhatsappNumber] =
    useState("");
  const [editCustomerSubmitting, setEditCustomerSubmitting] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [filterOrderSellerId, setFilterOrderSellerId] = useState("");

  const [orderSellerId, setOrderSellerId] = useState("");
  const [orderCustomerId, setOrderCustomerId] = useState("");
  const [orderProductId, setOrderProductId] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("1");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");

  const [orderAvailableCustomers, setOrderAvailableCustomers] = useState<
    Customer[]
  >([]);
  const [orderAvailableProducts, setOrderAvailableProducts] = useState<
    Product[]
  >([]);
  const [orderOptionsLoading, setOrderOptionsLoading] = useState(false);

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editOrderSellerId, setEditOrderSellerId] = useState("");
  const [editOrderCustomerId, setEditOrderCustomerId] = useState("");
  const [editOrderProductId, setEditOrderProductId] = useState("");
  const [editOrderQuantity, setEditOrderQuantity] = useState("1");
  const [editOrderStatus, setEditOrderStatus] =
    useState<OrderStatus>("pending");
  const [editOrderSubmitting, setEditOrderSubmitting] = useState(false);

  const [editOrderAvailableCustomers, setEditOrderAvailableCustomers] =
    useState<Customer[]>([]);
  const [editOrderAvailableProducts, setEditOrderAvailableProducts] = useState<
    Product[]
  >([]);
  const [editOrderOptionsLoading, setEditOrderOptionsLoading] = useState(false);

  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  // Plan
  const [planSellerId, setPlanSellerId] = useState("");
  const [sellerPlanData, setSellerPlanData] =
    useState<SellerPlanData | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planUpdating, setPlanUpdating] = useState(false);

  // Dashboard
  const [dashboardSellerId, setDashboardSellerId] = useState("");
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    fetchProducts("");
    fetchCustomers("");
    fetchOrders("");
    fetchDashboardSummary("");
  }, []);

  async function safeJson(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${label} copied.`);
    } catch (error) {
      console.error("Copy failed:", error);
      setMessage("Copy failed. Please copy manually.");
    }
  }

  function renderCopyButton(value: string, label: string) {
    return (
      <button
        type="button"
        onClick={() => copyText(value, label)}
        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Copy
      </button>
    );
  }

  async function fetchProducts(currentSellerId = filterSellerId) {
    try {
      setProductsLoading(true);

      const trimmedSellerId = currentSellerId.trim();
      const url = trimmedSellerId
        ? `${API_BASE_URL}/products?seller_id=${encodeURIComponent(
            trimmedSellerId
          )}`
        : `${API_BASE_URL}/products`;

      const response = await fetch(url);
      const result = await safeJson(response);

      setProducts(result?.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setMessage("Could not load products from backend.");
    } finally {
      setProductsLoading(false);
    }
  }

  async function fetchCustomers(currentSellerId = filterCustomerSellerId) {
    try {
      setCustomersLoading(true);

      const trimmedSellerId = currentSellerId.trim();
      const url = trimmedSellerId
        ? `${API_BASE_URL}/customers?seller_id=${encodeURIComponent(
            trimmedSellerId
          )}`
        : `${API_BASE_URL}/customers`;

      const response = await fetch(url);
      const result = await safeJson(response);

      setCustomers(result?.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setMessage("Could not load customers from backend.");
    } finally {
      setCustomersLoading(false);
    }
  }

  async function fetchOrders(currentSellerId = filterOrderSellerId) {
    try {
      setOrdersLoading(true);

      const trimmedSellerId = currentSellerId.trim();
      const url = trimmedSellerId
        ? `${API_BASE_URL}/orders?seller_id=${encodeURIComponent(
            trimmedSellerId
          )}`
        : `${API_BASE_URL}/orders`;

      const response = await fetch(url);
      const result = await safeJson(response);

      setOrders(result?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setMessage("Could not load orders from backend.");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function fetchDashboardSummary(currentSellerId = dashboardSellerId) {
    try {
      setDashboardLoading(true);
      setMessage("");

      const trimmedSellerId = currentSellerId.trim();
      const url = trimmedSellerId
        ? `${API_BASE_URL}/dashboard/summary?seller_id=${encodeURIComponent(
            trimmedSellerId
          )}`
        : `${API_BASE_URL}/dashboard/summary`;

      const response = await fetch(url);
      const result = await safeJson(response);

      if (!response.ok) {
        setDashboardSummary(null);
        setMessage(result?.detail || "Failed to load dashboard summary.");
        return;
      }

      setDashboardSummary(result?.data || null);
    } catch (error) {
      console.error("Failed to load dashboard summary:", error);
      setMessage("Something went wrong while loading dashboard summary.");
    } finally {
      setDashboardLoading(false);
    }
  }

  async function fetchSellerPlan(currentSellerId: string) {
    const trimmedSellerId = currentSellerId.trim();

    if (!trimmedSellerId) {
      setSellerPlan("free");
      setImageLimit(3);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/sellers/${encodeURIComponent(trimmedSellerId)}/plan`
      );

      const result = await safeJson(response);

      if (!response.ok) {
        setSellerPlan("free");
        setImageLimit(3);
        return;
      }

      const plan = result?.data?.plan || "free";

      setSellerPlan(plan);
      setImageLimit(getImageLimitByPlan(plan));
    } catch (error) {
      console.error("Failed to fetch seller plan:", error);
      setSellerPlan("free");
      setImageLimit(3);
    }
  }

  async function fetchPlanForSeller(currentSellerId = planSellerId) {
    const trimmedSellerId = currentSellerId.trim();

    if (!trimmedSellerId) {
      setMessage("Please enter a seller ID first.");
      return;
    }

    try {
      setPlanLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/sellers/${encodeURIComponent(trimmedSellerId)}/plan`
      );
      const result = await safeJson(response);

      if (!response.ok) {
        setSellerPlanData(null);
        setMessage(result?.detail || "Failed to load seller plan.");
        return;
      }

      setSellerPlanData(result?.data || null);
    } catch (error) {
      console.error("Failed to fetch seller plan:", error);
      setMessage("Something went wrong while loading seller plan.");
    } finally {
      setPlanLoading(false);
    }
  }

  async function fetchOrderOptionsForSeller(currentSellerId = orderSellerId) {
    const trimmedSellerId = currentSellerId.trim();

    if (!trimmedSellerId) {
      setMessage("Please enter a seller ID first.");
      return;
    }

    try {
      setOrderOptionsLoading(true);
      setMessage("");

      const [customersResponse, productsResponse] = await Promise.all([
        fetch(
          `${API_BASE_URL}/customers?seller_id=${encodeURIComponent(
            trimmedSellerId
          )}`
        ),
        fetch(
          `${API_BASE_URL}/products?seller_id=${encodeURIComponent(
            trimmedSellerId
          )}`
        ),
      ]);

      const customersResult = await safeJson(customersResponse);
      const productsResult = await safeJson(productsResponse);

      if (!customersResponse.ok || !productsResponse.ok) {
        setMessage("Failed to load customers or products for this seller.");
        return;
      }

      const loadedCustomers = customersResult?.data || [];
      const loadedProducts = productsResult?.data || [];

      setOrderAvailableCustomers(loadedCustomers);
      setOrderAvailableProducts(loadedProducts);

      if (loadedCustomers.length === 0 && loadedProducts.length === 0) {
        setMessage("No customers or products found for this seller.");
      } else if (loadedCustomers.length === 0) {
        setMessage("Products found, but no customers found for this seller.");
      } else if (loadedProducts.length === 0) {
        setMessage("Customers found, but no products found for this seller.");
      } else {
        setMessage("Customers and products loaded successfully.");
      }
    } catch (error) {
      console.error("Failed to load order options:", error);
      setMessage("Something went wrong while loading customers and products.");
    } finally {
      setOrderOptionsLoading(false);
    }
  }

  async function fetchEditOrderOptionsForSeller(currentSellerId: string) {
    const trimmedSellerId = currentSellerId.trim();

    if (!trimmedSellerId) {
      setMessage("Seller ID missing for this order.");
      return;
    }

    try {
      setEditOrderOptionsLoading(true);
      setMessage("");

      const [customersResponse, productsResponse] = await Promise.all([
        fetch(
          `${API_BASE_URL}/customers?seller_id=${encodeURIComponent(
            trimmedSellerId
          )}`
        ),
        fetch(
          `${API_BASE_URL}/products?seller_id=${encodeURIComponent(
            trimmedSellerId
          )}`
        ),
      ]);

      const customersResult = await safeJson(customersResponse);
      const productsResult = await safeJson(productsResponse);

      if (!customersResponse.ok || !productsResponse.ok) {
        setMessage("Failed to load edit dropdown options.");
        return;
      }

      setEditOrderAvailableCustomers(customersResult?.data || []);
      setEditOrderAvailableProducts(productsResult?.data || []);
    } catch (error) {
      console.error("Failed to load edit order options:", error);
      setMessage("Something went wrong while loading edit order options.");
    } finally {
      setEditOrderOptionsLoading(false);
    }
  }
   
  async function loadSellerHelper(currentSellerId = sellerHelperId) {
    const trimmedSellerId = currentSellerId.trim();

    if (!trimmedSellerId) {
      setMessage("Please enter a seller ID first.");
      return;
    }

    try {
      setSellerHelperLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/sellers/${encodeURIComponent(trimmedSellerId)}/plan`
      );

      const result = await safeJson(response);

      if (!response.ok) {
        setSellerHelperData(null);
        setMessage(result?.detail || "Failed to load seller information.");
        return;
      }

      setSellerHelperData(result?.data || null);
      setMessage("Seller information loaded successfully.");
    } catch (error) {
      console.error("Failed to load seller helper:", error);
      setMessage("Something went wrong while loading seller information.");
    } finally {
      setSellerHelperLoading(false);
    }
  }

  async function applySellerHelperAsGlobalSeller() {
    const selectedSellerId =
      sellerHelperData?.seller_id || sellerHelperId.trim();

    if (!selectedSellerId) {
      setMessage("Please load or enter a seller ID first.");
      return;
    }

    setGlobalSellerId(selectedSellerId);

    try {
      setGlobalSellerLoading(true);
      setMessage("");

      setActiveGlobalSellerId(selectedSellerId);

      setFilterSellerId(selectedSellerId);
      setFilterCustomerSellerId(selectedSellerId);
      setFilterOrderSellerId(selectedSellerId);

      setDashboardSellerId(selectedSellerId);
      setPlanSellerId(selectedSellerId);

      setSellerId(selectedSellerId);
      setCustomerSellerId(selectedSellerId);
      setOrderSellerId(selectedSellerId);

      setOrderCustomerId("");
      setOrderProductId("");

      await fetchProducts(selectedSellerId);
      await fetchCustomers(selectedSellerId);
      await fetchOrders(selectedSellerId);
      await fetchDashboardSummary(selectedSellerId);
      await fetchPlanForSeller(selectedSellerId);
      await fetchOrderOptionsForSeller(selectedSellerId);
      await fetchSellerPlan(selectedSellerId);

      setMessage("Seller applied as Global Seller successfully.");
    } catch (error) {
      console.error("Failed to apply seller helper as global seller:", error);
      setMessage("Something went wrong while applying seller as global seller.");
    } finally {
      setGlobalSellerLoading(false);
    }
  }

  async function applyGlobalSellerId() {
    const trimmedSellerId = globalSellerId.trim();

    if (!trimmedSellerId) {
      setMessage("Please enter a seller ID first.");
      return;
    }

    try {
      setGlobalSellerLoading(true);
      setMessage("");

      setActiveGlobalSellerId(trimmedSellerId);

      setFilterSellerId(trimmedSellerId);
      setFilterCustomerSellerId(trimmedSellerId);
      setFilterOrderSellerId(trimmedSellerId);

      setDashboardSellerId(trimmedSellerId);
      setPlanSellerId(trimmedSellerId);

      setSellerId(trimmedSellerId);
      setCustomerSellerId(trimmedSellerId);
      setOrderSellerId(trimmedSellerId);

      setOrderCustomerId("");
      setOrderProductId("");

      await fetchProducts(trimmedSellerId);
      await fetchCustomers(trimmedSellerId);
      await fetchOrders(trimmedSellerId);
      await fetchDashboardSummary(trimmedSellerId);
      await fetchPlanForSeller(trimmedSellerId);
      await fetchOrderOptionsForSeller(trimmedSellerId);
      await fetchSellerPlan(trimmedSellerId);

      setMessage(
        "Global seller ID applied. All sections and forms are synced."
      );
    } catch (error) {
      console.error("Failed to apply global seller ID:", error);
      setMessage("Something went wrong while applying global seller ID.");
    } finally {
      setGlobalSellerLoading(false);
    }
  }

  async function clearGlobalSellerId() {
    try {
      setGlobalSellerLoading(true);
      setMessage("");

      setGlobalSellerId("");
      setActiveGlobalSellerId("");

      setFilterSellerId("");
      setFilterCustomerSellerId("");
      setFilterOrderSellerId("");

      setDashboardSellerId("");
      setPlanSellerId("");
      setSellerPlanData(null);

      setSellerId("");
      setCustomerSellerId("");
      setOrderSellerId("");
      setOrderCustomerId("");
      setOrderProductId("");
      setOrderAvailableCustomers([]);
      setOrderAvailableProducts([]);

      setSellerPlan("free");
      setImageLimit(3);

      await fetchProducts("");
      await fetchCustomers("");
      await fetchOrders("");
      await fetchDashboardSummary("");

      setMessage("Global seller ID cleared. Showing overall data.");
    } catch (error) {
      console.error("Failed to clear global seller ID:", error);
      setMessage("Something went wrong while clearing global seller ID.");
    } finally {
      setGlobalSellerLoading(false);
    }
  }

  function syncFormsWithActiveGlobalSeller() {
    if (!activeGlobalSellerId) {
      return;
    }

    setSellerId(activeGlobalSellerId);
    setCustomerSellerId(activeGlobalSellerId);
    setOrderSellerId(activeGlobalSellerId);
    setPlanSellerId(activeGlobalSellerId);
    setDashboardSellerId(activeGlobalSellerId);
    setFilterSellerId(activeGlobalSellerId);
    setFilterCustomerSellerId(activeGlobalSellerId);
    setFilterOrderSellerId(activeGlobalSellerId);
  }

  function handleOpenProductForm() {
    const nextValue = !showProductForm;
    setShowProductForm(nextValue);

    if (nextValue && activeGlobalSellerId) {
      setSellerId(activeGlobalSellerId);
      fetchSellerPlan(activeGlobalSellerId);
    }
  }

  function handleOpenCustomerForm() {
    const nextValue = !showCustomerForm;
    setShowCustomerForm(nextValue);

    if (nextValue && activeGlobalSellerId) {
      setCustomerSellerId(activeGlobalSellerId);
    }
  }

  async function handleOpenOrderForm() {
    const nextValue = !showOrderForm;
    setShowOrderForm(nextValue);

    if (nextValue && activeGlobalSellerId) {
      setOrderSellerId(activeGlobalSellerId);
      setOrderCustomerId("");
      setOrderProductId("");
      await fetchOrderOptionsForSeller(activeGlobalSellerId);
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
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
    setSelectedImages((currentImages) =>
      currentImages.filter((_, index) => index !== indexToRemove)
    );
  }

  async function uploadProductImages(productId: string) {
    if (selectedImages.length === 0) {
      return;
    }

    const formData = new FormData();

    selectedImages.forEach((file) => {
      formData.append("files", file);
    });

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Image upload network error:", error);

      throw new Error(
        "Image upload failed because frontend could not connect to backend. Please check if FastAPI is running on http://127.0.0.1:8003."
      );
    }

    const result = await safeJson(response);

    if (!response.ok) {
      if (result?.detail?.message) {
        throw new Error(result.detail.message);
      }

      if (result?.detail?.upgrade_message) {
        throw new Error(result.detail.upgrade_message);
      }

      if (typeof result?.detail === "string") {
        throw new Error(result.detail);
      }

      throw new Error("Image upload failed.");
    }
  }

  async function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!sellerId.trim() || !productName.trim() || !productPrice) {
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
      setProductSubmitting(true);

      const productResponse = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_id: sellerId.trim(),
          name: productName.trim(),
          price: Number(productPrice),
          image_url: null,
        }),
      });

      const productResult = await safeJson(productResponse);

      if (!productResponse.ok) {
        if (productResult?.detail?.upgrade_message) {
          setMessage(productResult.detail.upgrade_message);
        } else if (productResult?.detail?.message) {
          setMessage(productResult.detail.message);
        } else if (typeof productResult?.detail === "string") {
          setMessage(productResult.detail);
        } else {
          setMessage("Failed to create product.");
        }

        return;
      }

      const newProduct = productResult?.data?.[0];

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
      setProductName("");
      setProductPrice("");
      setSelectedImages([]);
      setShowProductForm(false);

      await fetchProducts(filterSellerId || activeGlobalSellerId);
      await fetchOrders(filterOrderSellerId || activeGlobalSellerId);
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);

      if (orderSellerId.trim()) {
        await fetchOrderOptionsForSeller(orderSellerId);
      }

      if (editOrderSellerId.trim()) {
        await fetchEditOrderOptionsForSeller(editOrderSellerId);
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating product."
      );
    } finally {
      setProductSubmitting(false);
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

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to delete product.");
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );

      setMessage("Product deleted successfully.");
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);
    } catch (error) {
      console.error("Failed to delete product:", error);
      setMessage("Something went wrong while deleting product.");
    }
  }

  function openEditProductForm(product: Product) {
    if (editingProductId === product.id) {
      setEditingProductId(null);
      return;
    }

    setEditingProductId(product.id);
    setEditProductName(product.name);
    setEditProductPrice(String(product.price));
    setMessage("");
  }

  function cancelProductEdit() {
    setEditingProductId(null);
    setEditProductName("");
    setEditProductPrice("");
  }

  async function handleEditProduct(
    event: FormEvent<HTMLFormElement>,
    productId: string
  ) {
    event.preventDefault();
    setMessage("");

    if (!editProductName.trim()) {
      setMessage("Product name cannot be empty.");
      return;
    }

    if (!editProductPrice || Number(editProductPrice) <= 0) {
      setMessage("Price must be greater than 0.");
      return;
    }

    try {
      setEditProductSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editProductName.trim(),
          price: Number(editProductPrice),
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to update product.");
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                name: editProductName.trim(),
                price: Number(editProductPrice),
              }
            : product
        )
      );

      setMessage(`"${editProductName.trim()}" updated successfully.`);
      cancelProductEdit();
      await fetchOrders(filterOrderSellerId || activeGlobalSellerId);
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);
    } catch (error) {
      console.error("Failed to update product:", error);
      setMessage("Something went wrong while updating product.");
    } finally {
      setEditProductSubmitting(false);
    }
  }

  function resetCustomerForm() {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerFacebookId("");
    setCustomerWhatsappNumber("");
  }

  async function handleAddCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!customerSellerId.trim() || !customerName.trim()) {
      setMessage("Seller ID and customer name are required.");
      return;
    }

    try {
      setCustomerSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_id: customerSellerId.trim(),
          name: customerName.trim(),
          phone: customerPhone.trim() || null,
          address: customerAddress.trim() || null,
          facebook_id: customerFacebookId.trim() || null,
          whatsapp_number: customerWhatsappNumber.trim() || null,
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to create customer.");
        return;
      }

      setMessage("Customer added successfully.");
      resetCustomerForm();
      setShowCustomerForm(false);

      await fetchCustomers(filterCustomerSellerId || activeGlobalSellerId);
      await fetchOrders(filterOrderSellerId || activeGlobalSellerId);
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);

      if (orderSellerId.trim()) {
        await fetchOrderOptionsForSeller(orderSellerId);
      }

      if (editOrderSellerId.trim()) {
        await fetchEditOrderOptionsForSeller(editOrderSellerId);
      }
    } catch (error) {
      console.error("Failed to create customer:", error);
      setMessage("Something went wrong while creating customer.");
    } finally {
      setCustomerSubmitting(false);
    }
  }

  async function handleDeleteCustomer(customerId: string, customerName: string) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${customerName}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: "DELETE",
      });

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to delete customer.");
        return;
      }

      setCustomers((currentCustomers) =>
        currentCustomers.filter((customer) => customer.id !== customerId)
      );

      setMessage("Customer deleted successfully.");
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      setMessage("Something went wrong while deleting customer.");
    }
  }

  function openCustomerEditForm(customer: Customer) {
    if (editingCustomerId === customer.id) {
      setEditingCustomerId(null);
      return;
    }

    setEditingCustomerId(customer.id);
    setEditCustomerName(customer.name || "");
    setEditCustomerPhone(customer.phone || "");
    setEditCustomerAddress(customer.address || "");
    setEditCustomerFacebookId(customer.facebook_id || "");
    setEditCustomerWhatsappNumber(customer.whatsapp_number || "");
    setMessage("");
  }

  function cancelCustomerEdit() {
    setEditingCustomerId(null);
    setEditCustomerName("");
    setEditCustomerPhone("");
    setEditCustomerAddress("");
    setEditCustomerFacebookId("");
    setEditCustomerWhatsappNumber("");
  }

  async function handleEditCustomer(
    event: FormEvent<HTMLFormElement>,
    customerId: string
  ) {
    event.preventDefault();
    setMessage("");

    if (!editCustomerName.trim()) {
      setMessage("Customer name cannot be empty.");
      return;
    }

    try {
      setEditCustomerSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editCustomerName.trim(),
          phone: editCustomerPhone.trim() || null,
          address: editCustomerAddress.trim() || null,
          facebook_id: editCustomerFacebookId.trim() || null,
          whatsapp_number: editCustomerWhatsappNumber.trim() || null,
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to update customer.");
        return;
      }

      setCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.id === customerId
            ? {
                ...customer,
                name: editCustomerName.trim(),
                phone: editCustomerPhone.trim() || null,
                address: editCustomerAddress.trim() || null,
                facebook_id: editCustomerFacebookId.trim() || null,
                whatsapp_number: editCustomerWhatsappNumber.trim() || null,
              }
            : customer
        )
      );

      setMessage(`"${editCustomerName.trim()}" updated successfully.`);
      cancelCustomerEdit();
      await fetchOrders(filterOrderSellerId || activeGlobalSellerId);
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);
    } catch (error) {
      console.error("Failed to update customer:", error);
      setMessage("Something went wrong while updating customer.");
    } finally {
      setEditCustomerSubmitting(false);
    }
  }

  function resetOrderForm() {
    setOrderCustomerId("");
    setOrderProductId("");
    setOrderQuantity("1");
    setOrderStatus("pending");
  }

  async function handleAddOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (
      !orderSellerId.trim() ||
      !orderCustomerId.trim() ||
      !orderProductId.trim()
    ) {
      setMessage("Seller ID, customer, and product are required.");
      return;
    }

    if (!orderQuantity || Number(orderQuantity) <= 0) {
      setMessage("Quantity must be greater than 0.");
      return;
    }

    try {
      setOrderSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_id: orderSellerId.trim(),
          customer_id: orderCustomerId.trim(),
          product_id: orderProductId.trim(),
          quantity: Number(orderQuantity),
          status: orderStatus,
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to create order.");
        return;
      }

      setMessage("Order created successfully.");
      resetOrderForm();
      setShowOrderForm(false);

      await fetchOrders(filterOrderSellerId || activeGlobalSellerId);
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);
    } catch (error) {
      console.error("Failed to create order:", error);
      setMessage("Something went wrong while creating order.");
    } finally {
      setOrderSubmitting(false);
    }
  }

  async function handleDeleteOrder(orderId: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
      });

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to delete order.");
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.id !== orderId)
      );

      if (orderDetail?.order_id === orderId) {
        setOrderDetail(null);
      }

      setMessage("Order deleted successfully.");
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);
    } catch (error) {
      console.error("Failed to delete order:", error);
      setMessage("Something went wrong while deleting order.");
    }
  }

  function openOrderEditForm(order: Order) {
    if (editingOrderId === order.id) {
      cancelOrderEdit();
      return;
    }

    setEditingOrderId(order.id);
    setEditOrderSellerId(order.seller_id || "");
    setEditOrderCustomerId(order.customer_id || "");
    setEditOrderProductId(order.product_id || "");
    setEditOrderQuantity(String(order.quantity || 1));
    setEditOrderStatus(order.status || "pending");
    setMessage("");

    fetchEditOrderOptionsForSeller(order.seller_id);
  }

  function cancelOrderEdit() {
    setEditingOrderId(null);
    setEditOrderSellerId("");
    setEditOrderCustomerId("");
    setEditOrderProductId("");
    setEditOrderQuantity("1");
    setEditOrderStatus("pending");
    setEditOrderAvailableCustomers([]);
    setEditOrderAvailableProducts([]);
  }

  async function handleEditOrder(
    event: FormEvent<HTMLFormElement>,
    orderId: string
  ) {
    event.preventDefault();
    setMessage("");

    if (!editOrderCustomerId.trim() || !editOrderProductId.trim()) {
      setMessage("Customer and product are required.");
      return;
    }

    if (!editOrderQuantity || Number(editOrderQuantity) <= 0) {
      setMessage("Quantity must be greater than 0.");
      return;
    }

    try {
      setEditOrderSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: editOrderCustomerId.trim(),
          product_id: editOrderProductId.trim(),
          quantity: Number(editOrderQuantity),
          status: editOrderStatus,
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to update order.");
        return;
      }

      setMessage("Order updated successfully.");
      cancelOrderEdit();

      await fetchOrders(filterOrderSellerId || activeGlobalSellerId);
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);

      if (orderDetail?.order_id === orderId) {
        await fetchOrderDetail(orderId);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      setMessage("Something went wrong while updating order.");
    } finally {
      setEditOrderSubmitting(false);
    }
  }

  async function handleQuickStatusUpdate(order: Order, status: OrderStatus) {
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to update order status.");
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status,
              }
            : currentOrder
        )
      );

      setMessage("Order status updated successfully.");
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);

      if (orderDetail?.order_id === order.id) {
        await fetchOrderDetail(order.id);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      setMessage("Something went wrong while updating order status.");
    }
  }

  async function fetchOrderDetail(orderId: string) {
    try {
      setOrderDetailLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to load order detail.");
        return;
      }

      setOrderDetail(result?.data || null);
    } catch (error) {
      console.error("Failed to load order detail:", error);
      setMessage("Something went wrong while loading order detail.");
    } finally {
      setOrderDetailLoading(false);
    }
  }

  async function handleChangeSellerPlan(newPlan: string) {
    const trimmedSellerId = planSellerId.trim();

    if (!trimmedSellerId) {
      setMessage("Please enter a seller ID first.");
      return;
    }

    try {
      setPlanUpdating(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/sellers/${encodeURIComponent(trimmedSellerId)}/plan`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: newPlan,
          }),
        }
      );

      const result = await safeJson(response);

      if (!response.ok) {
        setMessage(result?.detail || "Failed to update seller plan.");
        return;
      }

      setMessage(`Seller plan changed to ${newPlan}.`);
      await fetchPlanForSeller(trimmedSellerId);
      await fetchProducts(filterSellerId || activeGlobalSellerId);
      await fetchDashboardSummary(dashboardSellerId || activeGlobalSellerId);
      await fetchSellerPlan(trimmedSellerId);
    } catch (error) {
      console.error("Failed to update seller plan:", error);
      setMessage("Something went wrong while updating seller plan.");
    } finally {
      setPlanUpdating(false);
    }
  }

  function getCustomerName(customerId: string) {
    return (
      customers.find((customer) => customer.id === customerId)?.name ||
      orderAvailableCustomers.find((customer) => customer.id === customerId)
        ?.name ||
      editOrderAvailableCustomers.find((customer) => customer.id === customerId)
        ?.name ||
      customerId
    );
  }

  function getProductName(productId: string) {
    return (
      products.find((product) => product.id === productId)?.name ||
      orderAvailableProducts.find((product) => product.id === productId)
        ?.name ||
      editOrderAvailableProducts.find((product) => product.id === productId)
        ?.name ||
      productId
    );
  }

  function selectTab(section: ActiveSection) {
    setActiveSection(section);
    setMessage("");

    if (activeGlobalSellerId) {
      syncFormsWithActiveGlobalSeller();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Hishabi MVP
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Seller Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage dashboard, products, customers, orders, and plans from
                one simple dashboard.
              </p>
            </div>

            <div>
              {activeSection === "seller" && (
          <>
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Seller Setup Helper
              </h2>

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

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">
                    Seller Information
                  </h2>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Seller ID
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="break-all font-mono text-sm text-slate-700">
                          {sellerHelperData.seller_id}
                        </p>
                        {renderCopyButton(
                          sellerHelperData.seller_id,
                          "Seller ID"
                        )}
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

                  <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <button
                      type="button"
                      onClick={applySellerHelperAsGlobalSeller}
                      disabled={globalSellerLoading}
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {globalSellerLoading
                        ? "Applying..."
                        : "Apply This Seller Globally"}
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
        )}

        {activeSection === "dashboard" && (
                <button
                  type="button"
                  onClick={() =>
                    fetchDashboardSummary(
                      dashboardSellerId || activeGlobalSellerId
                    )
                  }
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Refresh Summary
                </button>
              )}

              {activeSection === "products" && (
                <button
                  type="button"
                  onClick={handleOpenProductForm}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {showProductForm ? "Close Form" : "+ Add Product"}
                </button>
              )}

              {activeSection === "customers" && (
                <button
                  type="button"
                  onClick={handleOpenCustomerForm}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {showCustomerForm ? "Close Form" : "+ Add Customer"}
                </button>
              )}

              {activeSection === "orders" && (
                <button
                  type="button"
                  onClick={handleOpenOrderForm}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {showOrderForm ? "Close Form" : "+ Create Order"}
                </button>
              )}

              {activeSection === "plan" && (
                <button
                  type="button"
                  onClick={() =>
                    fetchPlanForSeller(planSellerId || activeGlobalSellerId)
                  }
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Refresh Plan
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {(
              [
                "dashboard",
                "seller",
                "products",
                "customers",
                "orders",
                "plan",
              ] as ActiveSection[]
            ).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => selectTab(section)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold capitalize transition ${
                  activeSection === section
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Global Seller ID
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Paste seller ID once and apply it across Dashboard, Products,
            Customers, Orders, and Plan sections. Forms will auto-fill using this
            seller.
          </p>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              value={globalSellerId}
              onChange={(event) => setGlobalSellerId(event.target.value)}
              placeholder="Paste seller ID once here"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />

            <button
              type="button"
              onClick={applyGlobalSellerId}
              disabled={globalSellerLoading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {globalSellerLoading ? "Applying..." : "Apply Seller ID"}
            </button>

            <button
              type="button"
              onClick={clearGlobalSellerId}
              disabled={globalSellerLoading}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          </div>

          {activeGlobalSellerId && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Active seller ID:</span>
              <span className="font-mono font-semibold text-slate-700">
                {activeGlobalSellerId}
              </span>
              {renderCopyButton(activeGlobalSellerId, "Active seller ID")}
            </div>
          )}
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Products</p>
            <h2 className="mt-2 text-3xl font-bold">{products.length}</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Customers</p>
            <h2 className="mt-2 text-3xl font-bold">{customers.length}</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Orders</p>
            <h2 className="mt-2 text-3xl font-bold">{orders.length}</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Current Module</p>
            <h2 className="mt-2 text-3xl font-bold capitalize">
              {activeSection}
            </h2>
          </div>
        </section>

        {message && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {message}
          </section>
        )}

        {activeSection === "dashboard" && (
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
              <section className="grid gap-4 md:grid-cols-3">
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
                    {dashboardSummary.total_sales} BDT
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Pending Orders</p>
                  <h2 className="mt-2 text-3xl font-bold">
                    {dashboardSummary.pending_orders}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Delivered Orders</p>
                  <h2 className="mt-2 text-3xl font-bold">
                    {dashboardSummary.delivered_orders}
                  </h2>
                </div>
              </section>
            )}
          </>
        )}

        {activeSection === "products" && (
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
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {productSubmitting ? "Adding..." : "Save Product"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Filter Products by Seller
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
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Apply Filter
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterSellerId("");
                    fetchProducts("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Show All
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Products</h2>

              {productsLoading && (
                <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
                  Loading products...
                </div>
              )}

              {!productsLoading && products.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
                  No products found.
                </div>
              )}

              {!productsLoading && products.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="h-48 bg-slate-100">
                        {product.image_url &&
                        product.image_url.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
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
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeSection === "customers" && (
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
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {customerSubmitting ? "Adding..." : "Save Customer"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCustomerForm(false)}
                      className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Apply Filter
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterCustomerSellerId("");
                    fetchCustomers("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Show All
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Customers</h2>

              {customersLoading && (
                <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
                  Loading customers...
                </div>
              )}

              {!customersLoading && customers.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
                  No customers found.
                </div>
              )}

              {!customersLoading && customers.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {customers.map((customer) => (
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
        )}

        {activeSection === "orders" && (
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
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
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

                        {orderAvailableCustomers.map((customer) => (
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

                        {orderAvailableProducts.map((product) => (
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
                      {ORDER_STATUSES.map((status) => (
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
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {orderSubmitting ? "Creating..." : "Create Order"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Apply Filter
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterOrderSellerId("");
                    fetchOrders("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Show All
                </button>
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
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
                <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
                  Loading orders...
                </div>
              )}

              {!ordersLoading && orders.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
                  No orders found.
                </div>
              )}

              {!ordersLoading && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => (
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
                              className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
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

                                {editOrderAvailableCustomers.map((customer) => (
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

                                {editOrderAvailableProducts.map((product) => (
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
                                {ORDER_STATUSES.map((status) => (
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
                              <h3 className="text-lg font-bold text-slate-900">
                                Order #{shortId(order.id)}
                              </h3>

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
                                {ORDER_STATUSES.map((status) => (
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
        )}

        {activeSection === "plan" && (
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
                  onChange={(event) => setPlanSellerId(event.target.value)}
                  placeholder="Paste seller ID to check or change plan"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={() => fetchPlanForSeller()}
                  disabled={planLoading}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
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
                        disabled={planUpdating || !planSellerId.trim()}
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
        )}
      </div>
    </main>
  );
}
