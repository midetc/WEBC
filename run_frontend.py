import os
import subprocess
import sys
from pathlib import Path

# Додаємо поточну директорію до PATH для імпортів
sys.path.append(str(Path(__file__).resolve().parent))

from backend.app.config import settings

if __name__ == "__main__":
    frontend_dir = Path(__file__).resolve().parent / "frontend"
    
    print(f"Starting frontend server on http://localhost:{settings.FRONTEND_PORT}")
    os.chdir(frontend_dir)
    
    # Використовуємо npm для запуску Next.js
    subprocess.run(["npm", "run", "dev", "--", "--port", str(settings.FRONTEND_PORT)]) 