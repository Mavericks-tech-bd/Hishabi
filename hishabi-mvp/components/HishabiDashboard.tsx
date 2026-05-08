"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import DashboardSection from "@/components/dashboard/DashboardSection";
import SellerSection from "@/components/seller/SellerSection";
import PlanSection from "@/components/plan/PlanSection";
import ProductsSection from "@/components/products/ProductsSection";
import CustomersSection from "@/components/customers/CustomersSection";
import OrdersSection from "@/components/orders/OrdersSection";
import { API_BASE_URL, getApiErrorMessage, safeJson } from "@/lib/api";
import type {
  ActiveSection,
  Customer,
  DashboardSummary,
  Order,
  OrderDetail,
  OrderStatus,
  Product,
  SellerPlanData,
} from "@/types";

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
  const [productSearchQuery, setProductSearchQuery] = useState("");

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
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

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
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatus | "all">("all");

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

  function isValidPositiveNumber(value: string) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0;
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

      if (!response.ok) {
        setProducts([]);
        setMessage(getApiErrorMessage(result, "Could not load products from backend."));
        return;
      }

      setProducts(result?.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
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

      if (!response.ok) {
        setCustomers([]);
        setMessage(getApiErrorMessage(result, "Could not load customers from backend."));
        return;
      }

      setCustomers(result?.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
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

      if (!response.ok) {
        setOrders([]);
        setMessage(getApiErrorMessage(result, "Could not load orders from backend."));
        return;
      }

      setOrders(result?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
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
        setMessage(getApiErrorMessage(result, "Failed to load dashboard summary."));
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
        setMessage(getApiErrorMessage(result, "Failed to load seller plan."));
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

    setOrderAvailableCustomers([]);
    setOrderAvailableProducts([]);
    setOrderCustomerId("");
    setOrderProductId("");

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

    setEditOrderAvailableCustomers([]);
    setEditOrderAvailableProducts([]);

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
        setMessage(getApiErrorMessage(result, "Failed to load seller information."));
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

      const sellerExists = await validateSellerExistsForFrontend(selectedSellerId);

      if (!sellerExists) {
        setActiveGlobalSellerId("");
        setOrderAvailableCustomers([]);
        setOrderAvailableProducts([]);
        setOrderCustomerId("");
        setOrderProductId("");
        setMessage("Seller not found. Please load a valid seller first.");
        return;
      }

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

  async function validateSellerExistsForFrontend(currentSellerId: string) {
    const trimmedSellerId = currentSellerId.trim();

    if (!trimmedSellerId) {
      return false;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/sellers/${encodeURIComponent(trimmedSellerId)}/plan`
      );

      return response.ok;
    } catch (error) {
      console.error("Failed to validate seller:", error);
      return false;
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

      const sellerExists = await validateSellerExistsForFrontend(trimmedSellerId);

      if (!sellerExists) {
        setActiveGlobalSellerId("");
        setOrderAvailableCustomers([]);
        setOrderAvailableProducts([]);
        setOrderCustomerId("");
        setOrderProductId("");
        setMessage("Seller not found. Please check the seller ID.");
        return;
      }

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

    if (!isValidPositiveNumber(productPrice)) {
      setMessage("Product price must be a valid number greater than 0.");
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
        setMessage(getApiErrorMessage(result, "Failed to delete product."));
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

    if (!editProductPrice || !isValidPositiveNumber(editProductPrice)) {
      setMessage("Price must be a valid number greater than 0.");
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
        setMessage(getApiErrorMessage(result, "Failed to update product."));
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
        setMessage(getApiErrorMessage(result, "Failed to create customer."));
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
        setMessage(getApiErrorMessage(result, "Failed to delete customer."));
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
        setMessage(getApiErrorMessage(result, "Failed to update customer."));
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

    if (!orderQuantity || !isValidPositiveNumber(orderQuantity)) {
      setMessage("Quantity must be a valid number greater than 0.");
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
        setMessage(getApiErrorMessage(result, "Failed to create order."));
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
        setMessage(getApiErrorMessage(result, "Failed to delete order."));
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

    if (!editOrderQuantity || !isValidPositiveNumber(editOrderQuantity)) {
      setMessage("Quantity must be a valid number greater than 0.");
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
        setMessage(getApiErrorMessage(result, "Failed to update order."));
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
        setMessage(getApiErrorMessage(result, "Failed to update order status."));
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
        setMessage(getApiErrorMessage(result, "Failed to load order detail."));
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

  function isPlanSellerLoaded() {
    return (
      !!sellerPlanData?.seller_id &&
      sellerPlanData.seller_id === planSellerId.trim()
    );
  }

  async function handleChangeSellerPlan(newPlan: string) {
    const trimmedSellerId = planSellerId.trim();

    if (!trimmedSellerId) {
      setMessage("Please enter a seller ID first.");
      return;
    }

    if (!isPlanSellerLoaded()) {
      setMessage("Please load a valid seller before changing plan.");
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
        setMessage(getApiErrorMessage(result, "Failed to update seller plan."));
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

  function getVisibleProducts() {
    const searchValue = productSearchQuery.trim().toLowerCase();

    if (!searchValue) {
      return products;
    }

    return products.filter((product) => {
      const searchableText = [
        product.name,
        String(product.price),
        product.id,
        product.seller_id,
        product.image_url,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchValue);
    });
  }

  function getVisibleCustomers() {
    const searchValue = customerSearchQuery.trim().toLowerCase();

    if (!searchValue) {
      return customers;
    }

    return customers.filter((customer) => {
      const searchableText = [
        customer.name,
        customer.phone,
        customer.whatsapp_number,
        customer.facebook_id,
        customer.address,
        customer.seller_id,
        customer.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchValue);
    });
  }

  function getCustomerPhone(customerId: string) {
    return (
      customers.find((customer) => customer.id === customerId)?.phone ||
      orderAvailableCustomers.find((customer) => customer.id === customerId)
        ?.phone ||
      editOrderAvailableCustomers.find((customer) => customer.id === customerId)
        ?.phone ||
      "Not added"
    );
  }

  function getProductPrice(productId: string) {
    const product =
      products.find((currentProduct) => currentProduct.id === productId) ||
      orderAvailableProducts.find(
        (currentProduct) => currentProduct.id === productId
      ) ||
      editOrderAvailableProducts.find(
        (currentProduct) => currentProduct.id === productId
      );

    return product?.price ?? null;
  }

  function getStatusBadgeClass(status: OrderStatus) {
    if (status === "pending") {
      return "bg-yellow-50 text-yellow-700 ring-yellow-200";
    }

    if (status === "confirmed") {
      return "bg-blue-50 text-blue-700 ring-blue-200";
    }

    if (status === "shipped") {
      return "bg-purple-50 text-purple-700 ring-purple-200";
    }

    if (status === "delivered") {
      return "bg-green-50 text-green-700 ring-green-200";
    }

    if (status === "cancelled") {
      return "bg-red-50 text-red-700 ring-red-200";
    }

    return "bg-slate-50 text-slate-700 ring-slate-200";
  }

  function getVisibleOrders() {
    if (orderStatusFilter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === orderStatusFilter);
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

  const extractedSectionProps = {
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
  };


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
          <SellerSection
            sellerHelperId={sellerHelperId}
            setSellerHelperId={setSellerHelperId}
            sellerHelperLoading={sellerHelperLoading}
            sellerHelperData={sellerHelperData}
            globalSellerLoading={globalSellerLoading}
            loadSellerHelper={loadSellerHelper}
            applySellerHelperAsGlobalSeller={applySellerHelperAsGlobalSeller}
            fetchPlanForSeller={fetchPlanForSeller}
            setActiveSection={setActiveSection}
            setPlanSellerId={setPlanSellerId}
            renderCopyButton={renderCopyButton}
            getImageLimitByPlan={getImageLimitByPlan}
          />
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
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Hishabi message
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {message}
                </p>
              </div>
            </div>
          </section>
        )}

        {activeSection === "dashboard" && (
          <DashboardSection
            dashboardSellerId={dashboardSellerId}
            setDashboardSellerId={setDashboardSellerId}
            dashboardLoading={dashboardLoading}
            dashboardSummary={dashboardSummary}
            fetchDashboardSummary={fetchDashboardSummary}
            formatTaka={formatTaka}
          />
        )}

        {activeSection === "products" && (
          <ProductsSection
            products={products}
            activeGlobalSellerId={activeGlobalSellerId}
            productsLoading={productsLoading}
            showProductForm={showProductForm}
            setShowProductForm={setShowProductForm}
            productSubmitting={productSubmitting}
            filterSellerId={filterSellerId}
            setFilterSellerId={setFilterSellerId}
            productSearchQuery={productSearchQuery}
            setProductSearchQuery={setProductSearchQuery}
            sellerId={sellerId}
            setSellerId={setSellerId}
            productName={productName}
            setProductName={setProductName}
            productPrice={productPrice}
            setProductPrice={setProductPrice}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            handleImageChange={handleImageChange}
            removeSelectedImage={removeSelectedImage}
            sellerPlan={sellerPlan}
            imageLimit={imageLimit}
            editingProductId={editingProductId}
            editProductName={editProductName}
            setEditProductName={setEditProductName}
            editProductPrice={editProductPrice}
            setEditProductPrice={setEditProductPrice}
            editProductSubmitting={editProductSubmitting}
            getVisibleProducts={getVisibleProducts}
            fetchProducts={fetchProducts}
            fetchSellerPlan={fetchSellerPlan}
            handleAddProduct={handleAddProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleEditProduct={handleEditProduct}
            cancelProductEdit={cancelProductEdit}
            openEditProductForm={openEditProductForm}
            handleOpenProductForm={handleOpenProductForm}
            renderCopyButton={renderCopyButton}
            getImageLimitByPlan={getImageLimitByPlan}
            formatTaka={formatTaka}
            shortId={shortId}
          />
        )}

        {activeSection === "customers" && (
          <CustomersSection sectionProps={extractedSectionProps} />
        )}

        {activeSection === "orders" && (
          <OrdersSection sectionProps={extractedSectionProps} />
        )}

        {activeSection === "plan" && (
          <PlanSection
            planSellerId={planSellerId}
            setPlanSellerId={setPlanSellerId}
            sellerPlanData={sellerPlanData}
            setSellerPlanData={setSellerPlanData}
            planLoading={planLoading}
            planUpdating={planUpdating}
            fetchPlanForSeller={fetchPlanForSeller}
            handleChangeSellerPlan={handleChangeSellerPlan}
            isPlanSellerLoaded={isPlanSellerLoaded}
            getImageLimitByPlan={getImageLimitByPlan}
            PLAN_OPTIONS={PLAN_OPTIONS}
            shortId={shortId}
            renderCopyButton={renderCopyButton}
          />
        )}
      </div>
    </main>
  );
}
