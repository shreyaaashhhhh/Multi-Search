from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/products", tags=["products"])

PRODUCTS = [
    {"id": 1, "name": "Wireless Noise-Canceling Headphones", "category": "electronics", "price": 1939, "imageKey": "headphones"},
    {"id": 2, "name": "Smart Fitness Watch", "category": "electronics", "price": 1493, "imageKey": "smartwatch"},
    {"id": 3, "name": "Bluetooth Portable Speaker", "category": "electronics", "price": 1189, "imageKey": "speaker"},
    {"id": 4, "name": "Modern JavaScript Guide", "category": "books", "price": 139, "imageKey": "javascriptBook"},
    {"id": 5, "name": "React Development Handbook", "category": "books", "price": 145, "imageKey": "reactBook"},
    {"id": 6, "name": "UI/UX Design Fundamentals", "category": "books", "price": 129, "imageKey": "uiuxBook"},
    {"id": 7, "name": "Casual Cotton T-Shirt", "category": "clothing", "price": 235, "imageKey": "tshirt"},
    {"id": 8, "name": "Slim Fit Denim Jeans", "category": "clothing", "price": 608, "imageKey": "jeans"},
    {"id": 9, "name": "Winter Hoodie", "category": "clothing", "price": 955, "imageKey": "hoodie"},
    {"id": 10, "name": "Gaming Mechanical Keyboard", "category": "electronics", "price": 1920, "imageKey": "keyboard"},
    {"id": 11, "name": "Wireless Ergonomic Mouse", "category": "electronics", "price": 499, "imageKey": "mouse"},
    {"id": 12, "name": "Laptop Backpack", "category": "clothing", "price": 700, "imageKey": "backpack"},
    {"id": 13, "name": "Data Structures Explained", "category": "books", "price": 142, "imageKey": "dataBook"},
    {"id": 14, "name": "Smartphone Tripod Stand", "category": "electronics", "price": 1315, "imageKey": "tripod"},
    {"id": 15, "name": "Premium Leather Jacket", "category": "clothing", "price": 1780, "imageKey": "jacket"},
]


@router.get("")
async def get_products():
    return PRODUCTS


@router.get("/{product_id}")
async def get_product(product_id: int):
    product = next((item for item in PRODUCTS if item["id"] == product_id), None)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
