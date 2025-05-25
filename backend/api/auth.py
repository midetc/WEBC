from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from passlib.context import CryptContext
import os
from pydantic import BaseModel, EmailStr, validator
import re

from database import get_db
from models import User

router = APIRouter()

# Використовуємо змінну середовища або фіксований ключ
SECRET_KEY = os.getenv("SECRET_KEY", "kpi-finance-app-2024-secure-key-do-not-share-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 години

# Налаштування bcrypt для хешування паролів
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 схема
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Пароль повинен містити мінімум 8 символів')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Пароль повинен містити літери')
        if not re.search(r'\d', v):
            raise ValueError('Пароль повинен містити цифри')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Ім\'я повинно містити мінімум 2 символи')
        return v.strip()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Перевірка пароля з bcrypt"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Хешування пароля з bcrypt"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Створення JWT токена"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
        "sub": str(data.get("sub")),  # email
        "user_id": data.get("user_id")
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Отримання користувача за email"""
    return db.query(User).filter(User.email == email.lower()).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Аутентифікація користувача - КРИТИЧНО ВАЖЛИВА ФУНКЦІЯ"""
    # Отримуємо користувача
    user = get_user_by_email(db, email)
    if not user:
        print(f"User not found: {email}")
        return None
    
    # Перевіряємо активність
    if not user.is_active:
        print(f"User not active: {email}")
        return None
    
    # КРИТИЧНО: Перевіряємо пароль
    if not verify_password(password, user.hashed_password):
        print(f"Invalid password for user: {email}")
        return None
    
    print(f"User authenticated successfully: {email}")
    return user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Реєстрація нового користувача"""
    
    # Перевірка існування користувача
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Користувач з таким email вже існує"
        )
    
    # Хешуємо пароль
    hashed_password = get_password_hash(user_data.password)
    
    # Створюємо користувача
    new_user = User(
        email=user_data.email.lower(),
        hashed_password=hashed_password,
        name=user_data.name,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Вхід користувача - КРИТИЧНА ФУНКЦІЯ"""
    
    print(f"Login attempt for: {form_data.username}")
    
    # КРИТИЧНО: Перевіряємо користувача та пароль
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Завжди повертаємо 401 для неправильних даних
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невірний email або пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Створюємо токен тільки для валідного користувача
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserResponse.from_orm(user)
    }

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Отримання поточного користувача з токена - КРИТИЧНА ФУНКЦІЯ"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не вдалося перевірити облікові дані",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Декодуємо токен
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        token_type: str = payload.get("type")
        
        # Перевіряємо всі поля токена
        if email is None or user_id is None or token_type != "access":
            print(f"Invalid token payload: email={email}, user_id={user_id}, type={token_type}")
            raise credentials_exception
            
    except JWTError as e:
        print(f"JWT decode error: {e}")
        raise credentials_exception
        
    # Отримуємо користувача з БД
    user = get_user_by_email(db, email)
    if user is None:
        print(f"User not found in DB: {email}")
        raise credentials_exception
    
    # Перевіряємо що ID співпадає
    if user.id != user_id:
        print(f"User ID mismatch: token={user_id}, db={user.id}")
        raise credentials_exception
    
    # Перевіряємо активність
    if not user.is_active:
        print(f"User not active: {email}")
        raise credentials_exception
        
    return user 

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Отримання інформації про поточного користувача"""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Вихід користувача"""
    # В реальному додатку тут можна додати токен в чорний список
    return {"message": "Успішно вийшли з системи"}

@router.put("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Зміна пароля"""
    
    # Перевіряємо старий пароль
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Невірний поточний пароль"
        )
    
    # Валідація нового пароля
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Новий пароль повинен містити мінімум 8 символів"
        )
    
    if not re.search(r'[A-Za-z]', new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Новий пароль повинен містити літери"
        )
    
    if not re.search(r'\d', new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Новий пароль повинен містити цифри"
        )
    
    # Оновлюємо пароль
    current_user.hashed_password = get_password_hash(new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Пароль успішно змінено"}

# Тестова функція для перевірки хешів
@router.get("/test-passwords")
async def test_passwords(db: Session = Depends(get_db)):
    """Тестова функція для перевірки паролів (видалити в продакшені)"""
    users = db.query(User).all()
    result = []
    
    for user in users:
        # Тестуємо правильні паролі
        test_passwords = {
            "test@example.com": "password123",
            "anna.ivanova@gmail.com": "mypassword",
            "dmitry.petrov@outlook.com": "securepass"
        }
        
        correct_password = test_passwords.get(user.email, "unknown")
        is_valid = verify_password(correct_password, user.hashed_password)
        
        result.append({
            "email": user.email,
            "id": user.id,
            "password_valid": is_valid,
            "hash_prefix": user.hashed_password[:20] + "..."
        })
    
    return result 