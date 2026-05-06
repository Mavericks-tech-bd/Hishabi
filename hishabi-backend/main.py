# FastAPI দিয়ে API বানানো হচ্ছে
from fastapi import FastAPI, HTTPException, UploadFile, File

# Frontend থেকে backend API call করার permission দেওয়ার জন্য CORS middleware
from fastapi.middleware.cors import CORSMiddleware

# Request body validate করার জন্য
from pydantic import BaseModel

# .env file থেকে Supabase keys load করার জন্য
from dotenv import load_dotenv

# Supabase database connect করার জন্য
from supabase import create_client

# Environment variables read করার জন্য
import os
import uuid


# .env file load
load_dotenv()


# FastAPI app create
app = FastAPI(title="Hishabi API")

# CORS setup
# এটা frontend থেকে backend API call করার permission দেয়
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"],
    allow_headers=["*"],
)


# Supabase client create
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


# ==========================================================
# Models
# এগুলো define করে কোন API request body-তে কী কী data লাগবে
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
    # seller plan update করার জন্য
    # allowed values: free, starter, max
    plan: str
def get_product_image_limit(plan: str):
    """
    Seller plan অনুযায়ী প্রতি product-এ কয়টা image upload করা যাবে।

    free = 3 images per product
    starter = 10 images per product
    max = 10 images per product
    """
    if plan == "free":
        return 3

    return 10


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
# Seller কোন package ব্যবহার করছে সেটা check/update করার জন্য
# ==========================================================

@app.get("/sellers/{seller_id}/plan")
def get_seller_plan(seller_id: str):
    """
    Seller ID দিলে seller-এর current plan, product limit,
    current product count, আর remaining products দেখাবে.
    """

    # 1. Seller info বের করি
    seller_response = supabase.table("sellers").select(
        "id, name, phone, plan, product_limit"
    ).eq("id", seller_id).execute()

    if not seller_response.data:
        raise HTTPException(status_code=404, detail="Seller not found")

    seller = seller_response.data[0]

    # 2. এই seller-এর কয়টা product আছে সেটা count করি
    products_response = supabase.table("products").select(
        "id"
    ).eq("seller_id", seller_id).execute()

    current_product_count = len(products_response.data)

    # 3. Plan এবং limit বের করি
    plan = seller.get("plan") or "free"
    product_limit = seller.get("product_limit")

    # 4. Max plan হলে unlimited দেখাবো
    if plan == "max":
        product_limit_display = "unlimited"
        remaining_products = "unlimited"
    else:
        # free হলে 10, starter হলে 50 fallback রাখছি
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
            "remaining_products": remaining_products
        }
    }


@app.put("/sellers/{seller_id}/plan")
def update_seller_plan(seller_id: str, plan_update: SellerPlanUpdate):
    """
    Seller-এর plan update করার route.

    Plans:
    - free = 10 products
    - starter = 50 products
    - max = unlimited products
    """

    selected_plan = plan_update.plan

    # 1. Valid plan কিনা check করি
    if selected_plan not in ["free", "starter", "max"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid plan. Allowed plans are: free, starter, max"
        )

    # 2. Plan অনুযায়ী product limit set করি
    if selected_plan == "free":
        product_limit = 10
    elif selected_plan == "starter":
        product_limit = 50
    else:
        product_limit = None  # max plan = unlimited

    # 3. Seller আছে কিনা check করি
    seller_response = supabase.table("sellers").select(
        "id"
    ).eq("id", seller_id).execute()

    if not seller_response.data:
        raise HTTPException(status_code=404, detail="Seller not found")

    # 4. Seller plan update করি
    response = supabase.table("sellers").update({
        "plan": selected_plan,
        "product_limit": product_limit
    }).eq("id", seller_id).execute()

    return {
        "message": "Seller plan updated successfully",
        "data": response.data
    }


# ==========================================================
# Products
# ==========================================================

@app.get("/products")
def get_products():
    response = supabase.table("products").select("*").execute()
    return {"data": response.data}


@app.get("/products/{product_id}")
def get_product_detail(product_id: str):
    response = supabase.table("products").select("*").eq("id", product_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"data": response.data[0]}
@app.get("/products/{product_id}/images")
def get_product_images(product_id: str):
    """
    Specific product-এর সব uploaded images দেখাবে।
    """

    response = supabase.table("product_images").select("*").eq(
        "product_id", product_id
    ).execute()

    return {"data": response.data}


@app.post("/products/{product_id}/images")
async def upload_product_images(
    product_id: str,
    files: list[UploadFile] = File(...)
):
    """
    Product image upload করার route.

    Rules:
    - free seller: max 3 images per product
    - starter seller: max 10 images per product
    - max seller: max 10 images per product
    """

    # 1. Product আছে কিনা check করি
    product_response = supabase.table("products").select("*").eq(
        "id", product_id
    ).execute()

    if not product_response.data:
        raise HTTPException(status_code=404, detail="Product not found")

    product = product_response.data[0]
    seller_id = product["seller_id"]

    # 2. Seller-এর plan বের করি
    seller_response = supabase.table("sellers").select(
        "id, plan"
    ).eq("id", seller_id).execute()

    if not seller_response.data:
        raise HTTPException(status_code=404, detail="Seller not found")

    seller = seller_response.data[0]
    plan = seller.get("plan") or "free"

    image_limit = get_product_image_limit(plan)

    # 3. এই product-এর already কয়টা image আছে count করি
    existing_images_response = supabase.table("product_images").select(
        "id"
    ).eq("product_id", product_id).execute()

    current_image_count = len(existing_images_response.data)
    new_image_count = len(files)

    # 4. Limit cross করলে block করি
    if current_image_count + new_image_count > image_limit:
     raise HTTPException(
        status_code=403,
        detail={
            "message": f"You cannot upload more than {image_limit} images for one product according to your plan.",
            "upgrade_message": (
                "Free plan allows 3 images per product. "
                "Starter and Max plans allow 10 images per product."
            ),
            "current_image_count": current_image_count,
            "trying_to_upload": new_image_count,
            "image_limit": image_limit,
            "current_plan": plan
        }
    )

    uploaded_images = []

    # 5. প্রতিটা image Supabase Storage-এ upload করি
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Only image files are allowed"
            )

        file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
        unique_file_name = f"{uuid.uuid4()}.{file_extension}"
        storage_path = f"{seller_id}/{product_id}/{unique_file_name}"

        file_bytes = await file.read()

        supabase.storage.from_("product-images").upload(
            storage_path,
            file_bytes,
            {
                "content-type": file.content_type
            }
        )

        public_url = supabase.storage.from_("product-images").get_public_url(
            storage_path
        )

        image_response = supabase.table("product_images").insert({
            "product_id": product_id,
            "seller_id": seller_id,
            "image_url": public_url,
            "storage_path": storage_path
        }).execute()

        uploaded_images.extend(image_response.data)

    # 6. products.image_url empty হলে first uploaded image main image হিসেবে set করি
    if uploaded_images and not product.get("image_url"):
        supabase.table("products").update({
            "image_url": uploaded_images[0]["image_url"]
        }).eq("id", product_id).execute()

    return {
        "message": "Images uploaded successfully",
        "data": uploaded_images
    }


@app.delete("/product-images/{image_id}")
def delete_product_image(image_id: str):
    """
    Product image delete করার route.
    Storage থেকেও delete করবে, database থেকেও delete করবে।
    """

    image_response = supabase.table("product_images").select("*").eq(
        "id", image_id
    ).execute()

    if not image_response.data:
        raise HTTPException(status_code=404, detail="Image not found")

    image = image_response.data[0]

    supabase.storage.from_("product-images").remove([
        image["storage_path"]
    ])

    response = supabase.table("product_images").delete().eq(
        "id", image_id
    ).execute()

    return {"data": response.data}


@app.post("/products")
def create_product(product: ProductCreate):
    """
    Product create করার route.

    Plan logic:
    - free plan = 10 products
    - starter plan = 50 products
    - max plan = unlimited products
    """

    # 1. Seller আছে কিনা এবং seller-এর plan/product_limit কত সেটা বের করি
    seller_response = supabase.table("sellers").select(
        "id, plan, product_limit"
    ).eq("id", product.seller_id).execute()

    if not seller_response.data:
        raise HTTPException(status_code=404, detail="Seller not found")

    seller = seller_response.data[0]
    current_plan = seller.get("plan") or "free"
    product_limit = seller.get("product_limit")

    # 2. এই seller-এর এখন কয়টা product আছে সেটা count করি
    products_response = supabase.table("products").select(
        "id"
    ).eq("seller_id", product.seller_id).execute()

    current_product_count = len(products_response.data)

    # 3. Max plan হলে কোনো product limit থাকবে না
    if current_plan == "max":
        response = supabase.table("products").insert({
            "seller_id": product.seller_id,
            "name": product.name,
            "price": product.price,
            "image_url": product.image_url
        }).execute()

        return {"data": response.data}

    # 4. Free/starter plan-এর জন্য limit set করি
    if product_limit is None:
        if current_plan == "starter":
            product_limit = 50
        else:
            product_limit = 10

    # 5. Limit পূর্ণ হলে product create block করব
    if current_product_count >= product_limit:
        if current_plan == "free":
            upgrade_message = "Upgrade to the 99 taka Starter package to add up to 50 products, or choose the 500 taka Max package for unlimited products."
        elif current_plan == "starter":
            upgrade_message = "Upgrade to the 500 taka Max package to add unlimited products."
        else:
            upgrade_message = "Upgrade your plan to add more products."

        raise HTTPException(
            status_code=403,
            detail={
                "message": f"Your current plan allows {product_limit} products only.",
                "upgrade_message": upgrade_message,
                "current_product_count": current_product_count,
                "product_limit": product_limit,
                "current_plan": current_plan
            }
        )

    # 6. Limit-এর নিচে থাকলে product create হবে
    response = supabase.table("products").insert({
        "seller_id": product.seller_id,
        "name": product.name,
        "price": product.price,
        "image_url": product.image_url
    }).execute()

    return {"data": response.data}


@app.put("/products/{product_id}")
def update_product(product_id: str, product: ProductUpdate):
    update_data = {}

    if product.name is not None:
        update_data["name"] = product.name

    if product.price is not None:
        update_data["price"] = product.price

    if product.image_url is not None:
        update_data["image_url"] = product.image_url

    response = supabase.table("products").update(update_data).eq("id", product_id).execute()

    return {"data": response.data}


@app.delete("/products/{product_id}")
def delete_product(product_id: str):
    response = supabase.table("products").delete().eq("id", product_id).execute()
    return {"data": response.data}


# ==========================================================
# Customers
# ==========================================================

@app.get("/customers")
def get_customers():
    response = supabase.table("customers").select("*").execute()
    return {"data": response.data}


@app.get("/customers/{customer_id}")
def get_customer_detail(customer_id: str):
    response = supabase.table("customers").select("*").eq("id", customer_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {"data": response.data[0]}


@app.post("/customers")
def create_customer(customer: CustomerCreate):
    response = supabase.table("customers").insert({
        "seller_id": customer.seller_id,
        "name": customer.name,
        "phone": customer.phone,
        "address": customer.address,
        "facebook_id": customer.facebook_id,
        "whatsapp_number": customer.whatsapp_number
    }).execute()

    return {"data": response.data}


@app.put("/customers/{customer_id}")
def update_customer(customer_id: str, customer: CustomerUpdate):
    update_data = {}

    if customer.name is not None:
        update_data["name"] = customer.name

    if customer.phone is not None:
        update_data["phone"] = customer.phone

    if customer.address is not None:
        update_data["address"] = customer.address

    if customer.facebook_id is not None:
        update_data["facebook_id"] = customer.facebook_id

    if customer.whatsapp_number is not None:
        update_data["whatsapp_number"] = customer.whatsapp_number

    response = supabase.table("customers").update(update_data).eq("id", customer_id).execute()

    return {"data": response.data}


@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: str):
    response = supabase.table("customers").delete().eq("id", customer_id).execute()
    return {"data": response.data}


# ==========================================================
# Orders
# ==========================================================

@app.get("/orders")
def get_orders():
    response = supabase.table("orders").select("*").execute()
    return {"data": response.data}


@app.get("/orders/{order_id}")
def get_order_detail(order_id: str):
    order_response = supabase.table("orders").select("*").eq("id", order_id).execute()

    if not order_response.data:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_response.data[0]

    customer_response = supabase.table("customers").select("*").eq("id", order["customer_id"]).execute()
    product_response = supabase.table("products").select("*").eq("id", order["product_id"]).execute()
    seller_response = supabase.table("sellers").select("*").eq("id", order["seller_id"]).execute()

    return {
        "data": {
            "order_id": order["id"],
            "status": order["status"],
            "quantity": order["quantity"],
            "total": order["total"],
            "created_at": order["created_at"],
            "customer": customer_response.data[0] if customer_response.data else None,
            "product": product_response.data[0] if product_response.data else None,
            "seller": seller_response.data[0] if seller_response.data else None
        }
    }


@app.post("/orders")
def create_order(order: OrderCreate):
    product_response = supabase.table("products").select("*").eq("id", order.product_id).execute()

    if not product_response.data:
        raise HTTPException(status_code=404, detail="Product not found")

    product = product_response.data[0]
    product_price = float(product["price"])
    total = product_price * order.quantity

    response = supabase.table("orders").insert({
        "seller_id": order.seller_id,
        "customer_id": order.customer_id,
        "product_id": order.product_id,
        "quantity": order.quantity,
        "total": total,
        "status": order.status
    }).execute()

    return {"data": response.data}


@app.put("/orders/{order_id}")
def update_order(order_id: str, order: OrderUpdate):
    update_data = {}

    if order.customer_id is not None:
        update_data["customer_id"] = order.customer_id

    if order.product_id is not None:
        update_data["product_id"] = order.product_id

    if order.quantity is not None:
        update_data["quantity"] = order.quantity

    if order.status is not None:
        update_data["status"] = order.status

    # product বা quantity change হলে total আবার calculate হবে
    if order.product_id is not None or order.quantity is not None:
        existing_order_response = supabase.table("orders").select("*").eq("id", order_id).execute()

        if not existing_order_response.data:
            raise HTTPException(status_code=404, detail="Order not found")

        existing_order = existing_order_response.data[0]

        product_id = order.product_id if order.product_id is not None else existing_order["product_id"]
        quantity = order.quantity if order.quantity is not None else existing_order["quantity"]

        product_response = supabase.table("products").select("*").eq("id", product_id).execute()

        if not product_response.data:
            raise HTTPException(status_code=404, detail="Product not found")

        product = product_response.data[0]
        product_price = float(product["price"])
        update_data["total"] = product_price * quantity

    response = supabase.table("orders").update(update_data).eq("id", order_id).execute()

    return {"data": response.data}


@app.delete("/orders/{order_id}")
def delete_order(order_id: str):
    response = supabase.table("orders").delete().eq("id", order_id).execute()
    return {"data": response.data}