@echo off
echo ========================================
echo 💰 Spendio - Запуск додатку
echo ========================================
echo.
echo Курсовий проект з веб-програмування
echo Розумне управління особистими фінансами
echo.

echo 🧹 Очищення кешу Python...
if exist backend\__pycache__ rmdir /s /q backend\__pycache__
if exist backend\api\__pycache__ rmdir /s /q backend\api\__pycache__

echo.
echo 🚀 Запускаю backend сервер (FastAPI)...
start "Spendio Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo ⏳ Чекаю 3 секунди для запуску backend...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Запускаю frontend додаток (Next.js)...
start "Spendio Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo ✅ ДОДАТОК ЗАПУЩЕНО!
echo ========================================
echo.
echo 📱 Відкрийте у браузері:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo 🧪 Для перевірки тестів:
echo   check_coverage.bat
echo.
echo ⚠️  Не закривайте це вікно!
echo    Воно потрібне для роботи додатку
echo.
echo ========================================
echo Натисніть будь-яку клавішу для виходу...
pause >nul

echo.
echo 🛑 Зупиняю сервери...
taskkill /f /im "python.exe" 2>nul
taskkill /f /im "node.exe" 2>nul
echo Готово! 