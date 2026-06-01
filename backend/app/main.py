from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import products, customers, orders

# Automatically create all database tables
# In production with heavy schema migrations, tools like Alembic are preferred,
# but automatic creation guarantees instant setup for local testing and container bootups.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack Inventory & Order Management System backend API.",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(customers.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)

@app.get("/")
def root_endpoint():
    return {
        "message": "Welcome to the Inventory & Order Management API",
        "status": "healthy",
        "version": "1.0.0",
        "documentation": "/docs"
    }
