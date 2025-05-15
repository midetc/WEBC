from pydantic import BaseSettings
import os
from typing import Optional

class Settings(BaseSettings):
    # У розробці використовуємо SQLite, в продакшені - PostgreSQL
    DATABASE_URL: str = "sqlite:///./data.db"
    
    # Для JWT аутентифікації
    SECRET_KEY: str = "dev_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Налаштування сервера
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 3000
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings() 