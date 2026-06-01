import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Inventory & Order Management API"
    API_V1_STR: str = "/api"
    
    # Database Configuration
    # Defaults to Docker Compose PostgreSQL service if not provided
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@db:5432/inventory"
    )
    
    # CORS Configuration
    # Accepts a comma-separated list of origins in the environment variable
    cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
    CORS_ORIGINS: list[str] = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

settings = Settings()
