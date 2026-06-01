from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from . import models, schemas

# ==========================================
# PRODUCT CRUD
# ==========================================
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).order_by(models.Product.created_at.desc()).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    # Enforce Unique SKU business rule
    existing_product = get_product_by_sku(db, sku=product.sku)
    if existing_product:
        raise ValueError(f"Product SKU '{product.sku}' is already taken.")
        
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
        
    update_data = product_update.model_dump(exclude_unset=True)
    
    # If SKU is being updated, verify uniqueness
    if "sku" in update_data and update_data["sku"] != db_product.sku:
        existing = get_product_by_sku(db, sku=update_data["sku"])
        if existing:
            raise ValueError(f"Product SKU '{update_data['sku']}' is already taken.")
            
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    db.delete(db_product)
    db.commit()
    return db_product


# ==========================================
# CUSTOMER CRUD
# ==========================================
def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).order_by(models.Customer.created_at.desc()).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    # Enforce Unique Email business rule
    existing_customer = get_customer_by_email(db, email=customer.email)
    if existing_customer:
        raise ValueError(f"Customer email '{customer.email}' is already registered.")
        
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, customer_update: schemas.CustomerUpdate):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
        
    update_data = customer_update.model_dump(exclude_unset=True)
    
    # If Email is being updated, verify uniqueness
    if "email" in update_data and update_data["email"] != db_customer.email:
        existing = get_customer_by_email(db, email=update_data["email"])
        if existing:
            raise ValueError(f"Customer email '{update_data['email']}' is already registered.")
            
    for key, value in update_data.items():
        setattr(db_customer, key, value)
        
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer


# ==========================================
# ORDER CRUD & BUSINESS LOGIC
# ==========================================
def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()

def create_order(db: Session, order_in: schemas.OrderCreate):
    # 1. Verify customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == order_in.customer_id).first()
    if not customer:
        raise ValueError(f"Customer with ID {order_in.customer_id} does not exist.")
        
    # We will compute the total dynamically based on current unit prices
    total_amount = 0.0
    order_items_to_create = []
    
    # Use transactional block with rollback capacity
    try:
        # 2. Iterate through items, lock rows, validate stock and reduce stock
        for item in order_in.items:
            # Query the product using with_for_update() to prevent race conditions during parallel transactions
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).with_for_update().first()
            
            if not product:
                raise ValueError(f"Product with ID {item.product_id} does not exist.")
                
            # Business Rule: Insufficient stock validation
            if product.stock < item.quantity:
                raise ValueError(
                    f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                    f"Requested: {item.quantity}, Available: {product.stock}."
                )
                
            # Business Rule: Automatic stock reduction
            product.stock -= item.quantity
            
            # Subtotal calculation
            subtotal = product.price * item.quantity
            total_amount += subtotal
            
            # Create OrderItem object
            order_item = models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price
            )
            order_items_to_create.append(order_item)
            
        # 3. Create the Main Order object
        db_order = models.Order(
            customer_id=order_in.customer_id,
            total_amount=total_amount,
            status="COMPLETED"
        )
        db.add(db_order)
        db.flush()  # Flushes db_order to DB so it generates the auto-incremented ID
        
        # Link items to the generated order_id
        for order_item in order_items_to_create:
            order_item.order_id = db_order.id
            db.add(order_item)
            
        db.commit()
        db.refresh(db_order)
        return db_order
        
    except Exception as e:
        db.rollback()
        raise e
