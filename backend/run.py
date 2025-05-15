import uvicorn
from app.db.init_db import init_db

if __name__ == "__main__":
    # Ініціалізуємо базу даних
    init_db()
    
    # Запускаємо Fast API сервер
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 