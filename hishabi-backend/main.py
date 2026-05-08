from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client
import os
import uuid


load_dotenv()

app = FastAPI(title="Hishabi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)


# ==========================================================
# Constants
# ==========================================================

ALLOWED_ORDER_STATUSES = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
]

ALLOWED_PLANS = ["free", "starter", "max"]


# ==========================================================
# Models
# ==========================================================

class ProductCreate(BaseModel):
    seller_id: str
    name: str
    price: float
    image_url: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    image_url: str | None = None


class CustomerCreate(BaseModel):
    seller_id: str
    name: str
    phone: str | None = None
    address: str | None = None
    facebook_id: str | None = None
    whatsapp_number: str | None = None


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    facebook_id: str | None = None
    whatsapp_number: str | None = None


class OrderCreate(BaseModel):
    seller_id: str
    customer_id: str
    product_id: str
    quantity: int = 1
    status: str = "pending"


class OrderUpdate(BaseModel):
    customer_id: str | None = None
    product_id: str | None = None
    quantity: int | None = None
    status: str | None = None


class SellerPlanUpdate(BaseModel):
    plan: str


# ==========================================================
# Helper Functions
# ==========================================================

def clean_text(value: str | None) -> str:
    if value is None:
        return ""
    return value.strip()


def clean_optional_text(value: str | None) -> str | None:
    cleaned_value = clean_text(value)
    return cleaned_value or None


def validate_required_id(value: str | None, field_name: str) -> str:
    cleaned_value = clean_text(value)

    if not cleaned_value:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} is required.",
        )

    return cleaned_value


def validate_uuid_id(value: str | None, field_name: str) -> str:
    cleaned_value = validate_required_id(value, field_name)

    try:
        uuid.UUID(cleaned_value)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}.",
        )

    return cleaned_value


def validate_required_text(value: str | None, field_name: str) -> str:
    cleaned_value = clean_text(value)

    if not cleaned_value:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} is required.",
        )

    return cleaned_value


def validate_price(price: float | None) -> float:
    if price is None:
        raise HTTPException(
            status_code=400,
            detail="Product price is required.",
        )

    if price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product price must be greater than 0.",
        )

    return price


def validate_quantity(quantity: int | None) -> int:
    if quantity is None:
        raise HTTPException(
            status_code=400,
            detail="Order quantity is required.",
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Order quantity must be greater than 0.",
        )

    return quantity


def validate_order_status(status: str | None) -> str:
    cleaned_status = clean_text(status)

    if not cleaned_status:
        raise HTTPException(
            status_code=400,
            detail="Order status is required.",
        )

    if cleaned_status not in ALLOWED_ORDER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid order status. Allowed statuses are: "
                "pending, confirmed, shipped, delivered, cancelled."
            ),
        )

    return cleaned_status


def get_product_image_limit(plan: str):
    if plan == "free":
        return 3

    return 10


def get_seller_or_404(seller_id: str):
    cleaned_seller_id = validate_uuid_id(seller_id, "Seller ID")

    response = (
        supabase
        .table("sellers")
        .select("*")
        .eq("id", cleaned_seller_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Seller not found. Please check the seller ID.",
        )

    return response.data[0]


def get_product_or_404(product_id: str):
    cleaned_product_id = validate_uuid_id(product_id, "Product ID")

    response = (
        supabase
        .table("products")
        .select("*")
        .eq("id", cleaned_product_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Product not found. Please check the product ID.",
        )

    return response.data[0]


def get_customer_or_404(customer_id: str):
    cleaned_customer_id = validate_uuid_id(customer_id, "Customer ID")

    response = (
        supabase
        .table("customers")
        .select("*")
        .eq("id", cleaned_customer_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Customer not found. Please check the customer ID.",
        )

    return response.data[0]


def get_order_or_404(order_id: str):
    cleaned_order_id = validate_uuid_id(order_id, "Order ID")

    response = (
        supabase
        .table("orders")
        .select("*")
        .eq("id", cleaned_order_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Order not found. Please check the order ID.",
        )

    return response.data[0]


def validate_customer_belongs_to_seller(customer, seller_id: str):
    if customer.get("seller_id") != seller_id:
        raise HTTPException(
            status_code=400,
            detail="Customer does not belong to this seller.",
        )


def validate_product_belongs_to_seller(product, seller_id: str):
    if product.get("seller_id") != seller_id:
        raise HTTPException(
            status_code=400,
            detail="Product does not belong to this seller.",
        )


# ==========================================================
# Basic Routes
# ==========================================================

@app.get("/")
def root():
    return {"message": "Hishabi API is running"}


@app.get("/test-db")
def test_db():
    response = supabase.table("sellers").select("*").execute()
    return {"data": response.data}


# ==========================================================
# Seller Plan Routes
# ==========================================================

@app.get("/sellers/{seller_id}/plan")
def get_seller_plan(seller_id: str):
    seller = get_seller_or_404(seller_id)

    seller_id = seller["id"]

    products_response = (
        supabase
        .table("products")
        .select("id")
        .eq("seller_id", seller_id)
        .execute()
    )

    current_product_count = len(products_response.data or [])

    plan = seller.get("plan") or "free"
    product_limit = seller.get("product_limit")

    if plan == "max":
        product_limit_display = "unlimited"
        remaining_products = "unlimited"
    else:
        if product_limit is None:
            product_limit = 50 if plan == "starter" else 10

        product_limit_display = product_limit
        remaining_products = max(product_limit - current_product_count, 0)

    return {
        "data": {
            "seller_id": seller["id"],
            "name": seller.get("name"),
            "phone": seller.get("phone"),
            "plan": plan,
            "product_limit": product_limit_display,
            "current_product_count": current_product_count,
            "remaining_products": remaining_products,
        }
    }


@app.put("/sellers/{seller_id}/plan")
def update_seller_plan(seller_id: str, plan_update: SellerPlanUpdate):
    selected_plan = clean_text(plan_update.plan)

    if selected_plan not in ALLOWED_PLANS:
        raise HTTPException(
            status_code=400,
            detail="Invalid plan. Allowed plans are: free, starter, max.",
        )

    seller = get_seller_or_404(seller_id)

    if selected_plan == "free":
        product_limit = 10
    elif selected_plan == "starter":
        product_limit = 50
    else:
        product_limit = None

    response = (
        supabase
        .table("sellers")
        .update(
            {
                "plan": selected_plan,
                "product_limit": product_limit,
            }
        )
        .eq("id", seller["id"])
        .execute()
    )

    return {
        "message": "Seller plan updated successfully",
        "data": response.data,
    }


# ==========================================================
# Products
# ==========================================================

@app.get("/products")
def get_products(seller_id: str | None = None):
    query = supabase.table("products").select("*")

    cleaned_seller_id = clean_text(seller_id)

    if cleaned_seller_id:
        get_seller_or_404(cleaned_seller_id)
        query = query.eq("seller_id", cleaned_seller_id)

    response = query.execute()

    return {"data": response.data}


@app.get("/products/{product_id}")
def get_product_detail(product_id: str):
    product = get_product_or_404(product_id)
    return {"data": product}


@app.get("/products/{product_id}/images")
def get_product_images(product_id: str):
    product = get_product_or_404(product_id)

    response = (
        supabase
        .table("product_images")
        .select("*")
        .eq("product_id", product["id"])
        .execute()
    )

    return {"data": response.data}


@app.post("/products/{product_id}/images")
async def upload_product_images(
    product_id: str,
    files: list[UploadFile] = File(...),
):
    product = get_product_or_404(product_id)

    seller_id = product["seller_id"]
    seller = get_seller_or_404(seller_id)

    plan = seller.get("plan") or "free"
    image_limit = get_product_image_limit(plan)

    if not files:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least one image file.",
        )

    existing_images_response = (
        supabase
        .table("product_images")
        .select("id")
        .eq("product_id", product["id"])
        .execute()
    )

    current_image_count = len(existing_images_response.data or [])
    new_image_count = len(files)

    if current_image_count + new_image_count > image_limit:
        raise HTTPException(
            status_code=403,
            detail={
                "message": (
                    f"You cannot upload more than {image_limit} images "
                    "for one product according to your plan."
                ),
                "upgrade_message": (
                    "Free plan allows 3 images per product. "
                    "Starter and Max plans allow 10 images per product."
                ),
                "current_image_count": current_image_count,
                "trying_to_upload": new_image_count,
                "image_limit": image_limit,
                "current_plan": plan,
            },
        )

    uploaded_images = []

    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Only image files are allowed.",
            )

        file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
        unique_file_name = f"{uuid.uuid4()}.{file_extension}"
        storage_path = f"{seller_id}/{product['id']}/{unique_file_name}"

        file_bytes = await file.read()

        supabase.storage.from_("product-images").upload(
            storage_path,
            file_bytes,
            {
                "content-type": file.content_type,
            },
        )

        public_url = supabase.storage.from_("product-images").get_public_url(
            storage_path
        )

        image_response = (
            supabase
            .table("product_images")
            .insert(
                {
                    "product_id": product["id"],
                    "seller_id": seller_id,
                    "image_url": public_url,
                    "storage_path": storage_path,
                }
            )
            .execute()
        )

        uploaded_images.extend(image_response.data)

    if uploaded_images and not product.get("image_url"):
        (
            supabase
            .table("products")
            .update(
                {
                    "image_url": uploaded_images[0]["image_url"],
                }
            )
            .eq("id", product["id"])
            .execute()
        )

    return {
        "message": "Images uploaded successfully",
        "data": uploaded_images,
    }


@app.delete("/product-images/{image_id}")
def delete_product_image(image_id: str):
    cleaned_image_id = validate_required_id(image_id, "Image ID")

    image_response = (
        supabase
        .table("product_images")
        .select("*")
        .eq("id", cleaned_image_id)
        .execute()
    )

    if not image_response.data:
        raise HTTPException(
            status_code=404,
            detail="Image not found. Please check the image ID.",
        )

    image = image_response.data[0]

    supabase.storage.from_("product-images").remove(
        [
            image["storage_path"],
        ]
    )

    response = (
        supabase
        .table("product_images")
        .delete()
        .eq("id", cleaned_image_id)
        .execute()
    )

    return {"data": response.data}


@app.post("/products")
def create_product(product: ProductCreate):
    seller_id = validate_uuid_id(product.seller_id, "Seller ID")
    product_name = validate_required_text(product.name, "Product name")
    product_price = validate_price(product.price)

    seller = get_seller_or_404(seller_id)

    current_plan = seller.get("plan") or "free"
    product_limit = seller.get("product_limit")

    products_response = (
        supabase
        .table("products")
        .select("id")
        .eq("seller_id", seller_id)
        .execute()
    )

    current_product_count = len(products_response.data or [])

    if current_plan == "max":
        response = (
            supabase
            .table("products")
            .insert(
                {
                    "seller_id": seller_id,
                    "name": product_name,
                    "price": product_price,
                    "image_url": product.image_url,
                }
            )
            .execute()
        )

        return {"data": response.data}

    if product_limit is None:
        if current_plan == "starter":
            product_limit = 50
        else:
            product_limit = 10

    if current_product_count >= product_limit:
        if current_plan == "free":
            upgrade_message = (
                "Upgrade to the 99 taka Starter package to add up to 50 products, "
                "or choose the 500 taka Max package for unlimited products."
            )
        elif current_plan == "starter":
            upgrade_message = (
                "Upgrade to the 500 taka Max package to add unlimited products."
            )
        else:
            upgrade_message = "Upgrade your plan to add more products."

        raise HTTPException(
            status_code=403,
            detail={
                "message": f"Your current plan allows {product_limit} products only.",
                "upgrade_message": upgrade_message,
                "current_product_count": current_product_count,
                "product_limit": product_limit,
                "current_plan": current_plan,
            },
        )

    response = (
        supabase
        .table("products")
        .insert(
            {
                "seller_id": seller_id,
                "name": product_name,
                "price": product_price,
                "image_url": product.image_url,
            }
        )
        .execute()
    )

    return {"data": response.data}


@app.put("/products/{product_id}")
def update_product(product_id: str, product: ProductUpdate):
    existing_product = get_product_or_404(product_id)

    update_data = {}

    if product.name is not None:
        update_data["name"] = validate_required_text(
            product.name,
            "Product name",
        )

    if product.price is not None:
        update_data["price"] = validate_price(product.price)

    if product.image_url is not None:
        update_data["image_url"] = clean_optional_text(product.image_url)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No product fields were provided for update.",
        )

    response = (
        supabase
        .table("products")
        .update(update_data)
        .eq("id", existing_product["id"])
        .execute()
    )

    return {"data": response.data}


@app.delete("/products/{product_id}")
def delete_product(product_id: str):
    product = get_product_or_404(product_id)

    response = (
        supabase
        .table("products")
        .delete()
        .eq("id", product["id"])
        .execute()
    )

    return {"data": response.data}


# ==========================================================
# Customers
# ==========================================================

@app.get("/customers")
def get_customers(seller_id: str | None = None):
    query = supabase.table("customers").select("*")

    cleaned_seller_id = clean_text(seller_id)

    if cleaned_seller_id:
        get_seller_or_404(cleaned_seller_id)
        query = query.eq("seller_id", cleaned_seller_id)

    response = query.execute()

    return {"data": response.data}


@app.get("/customers/{customer_id}")
def get_customer_detail(customer_id: str):
    customer = get_customer_or_404(customer_id)
    return {"data": customer}


@app.post("/customers")
def create_customer(customer: CustomerCreate):
    seller_id = validate_uuid_id(customer.seller_id, "Seller ID")
    customer_name = validate_required_text(customer.name, "Customer name")

    get_seller_or_404(seller_id)

    response = (
        supabase
        .table("customers")
        .insert(
            {
                "seller_id": seller_id,
                "name": customer_name,
                "phone": clean_optional_text(customer.phone),
                "address": clean_optional_text(customer.address),
                "facebook_id": clean_optional_text(customer.facebook_id),
                "whatsapp_number": clean_optional_text(customer.whatsapp_number),
            }
        )
        .execute()
    )

    return {"data": response.data}


@app.put("/customers/{customer_id}")
def update_customer(customer_id: str, customer: CustomerUpdate):
    existing_customer = get_customer_or_404(customer_id)

    update_data = {}

    if customer.name is not None:
        update_data["name"] = validate_required_text(
            customer.name,
            "Customer name",
        )

    if customer.phone is not None:
        update_data["phone"] = clean_optional_text(customer.phone)

    if customer.address is not None:
        update_data["address"] = clean_optional_text(customer.address)

    if customer.facebook_id is not None:
        update_data["facebook_id"] = clean_optional_text(customer.facebook_id)

    if customer.whatsapp_number is not None:
        update_data["whatsapp_number"] = clean_optional_text(
            customer.whatsapp_number
        )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No customer fields were provided for update.",
        )

    response = (
        supabase
        .table("customers")
        .update(update_data)
        .eq("id", existing_customer["id"])
        .execute()
    )

    return {"data": response.data}


@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: str):
    customer = get_customer_or_404(customer_id)

    response = (
        supabase
        .table("customers")
        .delete()
        .eq("id", customer["id"])
        .execute()
    )

    return {"data": response.data}


# ==========================================================
# Orders
# ==========================================================

@app.get("/orders")
def get_orders(seller_id: str | None = None):
    query = supabase.table("orders").select("*")

    cleaned_seller_id = clean_text(seller_id)

    if cleaned_seller_id:
        get_seller_or_404(cleaned_seller_id)
        query = query.eq("seller_id", cleaned_seller_id)

    response = query.execute()

    return {"data": response.data}


@app.get("/orders/{order_id}")
def get_order_detail(order_id: str):
    order = get_order_or_404(order_id)

    customer_response = (
        supabase
        .table("customers")
        .select("*")
        .eq("id", order["customer_id"])
        .execute()
    )

    product_response = (
        supabase
        .table("products")
        .select("*")
        .eq("id", order["product_id"])
        .execute()
    )

    seller_response = (
        supabase
        .table("sellers")
        .select("*")
        .eq("id", order["seller_id"])
        .execute()
    )

    return {
        "data": {
            "order_id": order["id"],
            "status": order["status"],
            "quantity": order["quantity"],
            "total": order["total"],
            "created_at": order.get("created_at"),
            "customer": customer_response.data[0] if customer_response.data else None,
            "product": product_response.data[0] if product_response.data else None,
            "seller": seller_response.data[0] if seller_response.data else None,
        }
    }


@app.post("/orders")
def create_order(order: OrderCreate):
    seller_id = validate_uuid_id(order.seller_id, "Seller ID")
    customer_id = validate_uuid_id(order.customer_id, "Customer ID")
    product_id = validate_uuid_id(order.product_id, "Product ID")
    quantity = validate_quantity(order.quantity)
    status = validate_order_status(order.status)

    get_seller_or_404(seller_id)

    customer = get_customer_or_404(customer_id)
    product = get_product_or_404(product_id)

    validate_customer_belongs_to_seller(customer, seller_id)
    validate_product_belongs_to_seller(product, seller_id)

    product_price = float(product["price"])
    total = product_price * quantity

    response = (
        supabase
        .table("orders")
        .insert(
            {
                "seller_id": seller_id,
                "customer_id": customer_id,
                "product_id": product_id,
                "quantity": quantity,
                "total": total,
                "status": status,
            }
        )
        .execute()
    )

    return {"data": response.data}


@app.put("/orders/{order_id}")
def update_order(order_id: str, order: OrderUpdate):
    existing_order = get_order_or_404(order_id)

    seller_id = existing_order["seller_id"]
    update_data = {}

    if order.customer_id is not None:
        customer_id = validate_uuid_id(order.customer_id, "Customer ID")
        customer = get_customer_or_404(customer_id)
        validate_customer_belongs_to_seller(customer, seller_id)
        update_data["customer_id"] = customer_id

    if order.product_id is not None:
        product_id = validate_uuid_id(order.product_id, "Product ID")
        product = get_product_or_404(product_id)
        validate_product_belongs_to_seller(product, seller_id)
        update_data["product_id"] = product_id

    if order.quantity is not None:
        update_data["quantity"] = validate_quantity(order.quantity)

    if order.status is not None:
        update_data["status"] = validate_order_status(order.status)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No order fields were provided for update.",
        )

    if order.product_id is not None or order.quantity is not None:
        product_id_for_total = update_data.get(
            "product_id",
            existing_order["product_id"],
        )
        quantity_for_total = update_data.get(
            "quantity",
            existing_order["quantity"],
        )

        product_for_total = get_product_or_404(product_id_for_total)
        validate_product_belongs_to_seller(product_for_total, seller_id)

        product_price = float(product_for_total["price"])
        update_data["total"] = product_price * quantity_for_total

    response = (
        supabase
        .table("orders")
        .update(update_data)
        .eq("id", existing_order["id"])
        .execute()
    )

    return {"data": response.data}


@app.delete("/orders/{order_id}")
def delete_order(order_id: str):
    order = get_order_or_404(order_id)

    response = (
        supabase
        .table("orders")
        .delete()
        .eq("id", order["id"])
        .execute()
    )

    return {"data": response.data}


# ==========================================================
# Dashboard Summary
# ==========================================================

@app.get("/dashboard/summary")
def get_dashboard_summary(seller_id: str | None = None):
    products_query = supabase.table("products").select("id")
    customers_query = supabase.table("customers").select("id")
    orders_query = supabase.table("orders").select("id, total, status")

    cleaned_seller_id = clean_text(seller_id)

    if cleaned_seller_id:
        get_seller_or_404(cleaned_seller_id)
        products_query = products_query.eq("seller_id", cleaned_seller_id)
        customers_query = customers_query.eq("seller_id", cleaned_seller_id)
        orders_query = orders_query.eq("seller_id", cleaned_seller_id)

    products_response = products_query.execute()
    customers_response = customers_query.execute()
    orders_response = orders_query.execute()

    products = products_response.data or []
    customers = customers_response.data or []
    orders = orders_response.data or []

    total_sales = 0

    for order in orders:
        order_total = order.get("total") or 0
        total_sales += float(order_total)

    pending_orders = len(
        [
            order
            for order in orders
            if order.get("status") == "pending"
        ]
    )

    confirmed_orders = len(
        [
            order
            for order in orders
            if order.get("status") == "confirmed"
        ]
    )

    shipped_orders = len(
        [
            order
            for order in orders
            if order.get("status") == "shipped"
        ]
    )

    delivered_orders = len(
        [
            order
            for order in orders
            if order.get("status") == "delivered"
        ]
    )

    cancelled_orders = len(
        [
            order
            for order in orders
            if order.get("status") == "cancelled"
        ]
    )

    average_order_value = 0

    if len(orders) > 0:
        average_order_value = total_sales / len(orders)

    return {
        "data": {
            "total_products": len(products),
            "total_customers": len(customers),
            "total_orders": len(orders),
            "total_sales": total_sales,
            "average_order_value": average_order_value,
            "pending_orders": pending_orders,
            "confirmed_orders": confirmed_orders,
            "shipped_orders": shipped_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
        }
    }
