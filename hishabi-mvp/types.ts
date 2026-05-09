export type Product = {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  image_url?: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  seller_id: string;
  image_url: string;
  storage_path?: string | null;
};

export type Customer = {
  id: string;
  seller_id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  facebook_id?: string | null;
  whatsapp_number?: string | null;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  seller_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  total?: number | null;
  status: OrderStatus;
};

export type OrderDetail = {
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

export type SellerPlanData = {
  seller_id: string;
  name?: string | null;
  phone?: string | null;
  plan: string;
  product_limit: number | "unlimited";
  current_product_count: number;
  remaining_products: number | "unlimited";
};

export type DashboardSummary = {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_sales: number;
  average_order_value: number;
  pending_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
};

export type ActiveSection =
  | "dashboard"
  | "seller"
  | "products"
  | "customers"
  | "orders"
  | "plan";
