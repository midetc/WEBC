@echo off
chcp 65001 >nul
echo ========================================
echo    SPENDIO - Автоматичне налаштування
echo ========================================
echo.

echo [1/6] Перевірка Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не знайдено! Встановіть Python 3.11+ з python.org
    pause
    exit /b 1
)
echo ✅ Python знайдено

echo.
echo [2/6] Створення віртуального середовища...
if not exist "venv" (
    python -m venv venv
    echo ✅ Віртуальне середовище створено
) else (
    echo ✅ Віртуальне середовище вже існує
)

echo.
echo [3/6] Активація віртуального середовища...
call venv\Scripts\activate.bat
echo ✅ Віртуальне середовище активовано

echo.
echo [4/6] Встановлення Python залежностей...
pip install --upgrade pip
pip install -r backend/requirements.txt
echo ✅ Python залежності встановлено

echo.
echo [5/6] Перевірка Node.js та встановлення frontend залежностей...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не знайдено! Встановіть Node.js 18+ з nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js знайдено

cd frontend
if not exist "node_modules" (
    echo Встановлення npm залежностей...
    npm install
    echo ✅ Frontend залежності встановлено
) else (
    echo ✅ Frontend залежності вже встановлено
)
cd ..

echo.
echo [6/6] Запуск проекту...
echo ✅ Налаштування завершено!
echo.
echo 🚀 Запускаю Spendio...
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Натисніть Ctrl+C для зупинки серверів
echo.

start "Spendio Backend" cmd /k "call venv\Scripts\activate.bat && cd backend && python -m uvicorn main:app --reload --port 8000"
start "Spendio Frontend" cmd /k "cd frontend && npm run dev"

echo ✅ Сервери запущено в окремих вікнах
echo.
echo Якщо вікна не відкрилися автоматично, запустіть start.bat
pause 