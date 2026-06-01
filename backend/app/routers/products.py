from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, crud

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/", response_model=List[schemas.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_product(db=db, product=product)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    try:
        db_product = crud.update_product(db=db, product_id=product_id, product_update=product)
        if db_product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        return db_product
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{product_id}", response_model=schemas.ProductResponse)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.delete_product(db=db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product
