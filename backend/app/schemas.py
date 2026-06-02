from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional

# ==========================================
# PRODUCT SCHEMAS
# ==========================================
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Product display name")
    sku: str = Field(..., min_length=3, max_length=50, description="Stock Keeping Unit (Unique)")
    price: float = Field(..., gt=0, description="Unit price (must be greater than 0)")
    stock: int = Field(default=0, ge=0, description="Available inventory stock (cannot be negative)")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    sku: Optional[str] = Field(None, min_length=3, max_length=50)
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# CUSTOMER SCHEMAS
# ==========================================
class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr = Field(..., description="Unique customer email address")
    phone: Optional[str] = Field(None, max_length=20)

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# ORDER ITEM SCHEMAS
# ==========================================
class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0, description="ID of product being ordered")
    quantity: int = Field(..., gt=0, description="Quantity being ordered (must be greater than 0)")

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


# ==========================================
# ORDER SCHEMAS
# ==========================================
class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0, description="ID of the customer placing the order")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of items in the order (at least one is required)")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: datetime
    customer: CustomerResponse
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


# ==========================================
# USER & AUTHENTICATION SCHEMAS
# ==========================================
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Unique user email address")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

