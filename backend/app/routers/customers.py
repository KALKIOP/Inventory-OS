from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, crud

router = APIRouter(
    prefix="/customers",
    tags=["customers"]
)

@router.get("/", response_model=List[schemas.CustomerResponse])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_customers(db, skip=skip, limit=limit)

@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def read_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.post("/", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_customer(db=db, customer=customer)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(customer_id: int, customer: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    try:
        db_customer = crud.update_customer(db=db, customer_id=customer_id, customer_update=customer)
        if db_customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")
        return db_customer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{customer_id}", response_model=schemas.CustomerResponse)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud.delete_customer(db=db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer
