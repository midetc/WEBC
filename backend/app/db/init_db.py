from sqlalchemy.orm import Session
from app.models.models import Base
from app.db.database import engine

def init_db():
    # Створення всіх таблиць в базі даних
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db() 