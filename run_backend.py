import os
import sys
import uvicorn
from pathlib import Path

# Додаємо поточну директорію до PATH для імпортів
sys.path.append(str(Path(__file__).resolve().parent))

from backend.app.config import settings

if __name__ == "__main__":
    # Запускаємо FastAPI сервер
    print(f"Starting backend server on http://localhost:{settings.BACKEND_PORT}")
    uvicorn.run(
        "backend.app.main:app", 
        host="0.0.0.0", 
        port=settings.BACKEND_PORT, 
        reload=True
    ) 