
import sqlite3
from datetime import datetime, timedelta
import random
from passlib.context import CryptContext

def check_database():
    try:
        conn = sqlite3.connect('data.db')
        cursor = conn.cursor()
        

        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("=== ПЕРЕВІРКА БАЗИ ДАНИХ ===")
        print(f"Знайдено таблиць: {len(tables)}")
        print(f"Список таблиць: {[table[0] for table in tables]}")
        print()
        

        for table in tables:
            table_name = table[0]
            print(f"📋 Таблиця: {table_name}")
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            for column in columns:
                col_id, col_name, col_type, not_null, default_val, pk = column
                pk_mark = " (PK)" if pk else ""
                null_mark = " NOT NULL" if not_null else ""
                print(f"  ├─ {col_name}: {col_type}{pk_mark}{null_mark}")
            

            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            print(f"  └─ Записів: {count}")
            print()
        
        conn.close()
        print("✅ Перевірка завершена успішно!")
        
    except Exception as e:
        print(f"❌ Помилка при перевірці БД: {e}")

def seed_database():
    try:
        conn = sqlite3.connect('data.db')
        cursor = conn.cursor()
        

        cursor.execute("SELECT COUNT(*) FROM categories WHERE is_default = 1;")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"Стандартні категорії вже існують ({existing_count} шт.)")
            return
        

        default_categories = [
            ("Продукти", "Покупка продуктів харчування", "#4CAF50", "🛒", 1, None),
            ("Транспорт", "Витрати на транспорт", "#2196F3", "🚗", 1, None),
            ("Розваги", "Розваги та дозвілля", "#FF9800", "🎬", 1, None),
            ("Здоров'я", "Медичні витрати", "#F44336", "🏥", 1, None),
            ("Освіта", "Витрати на освіту", "#9C27B0", "📚", 1, None),
            ("Одяг", "Покупка одягу та взуття", "#E91E63", "👕", 1, None),
            ("Комунальні", "Комунальні платежі", "#607D8B", "🏠", 1, None),
            ("Інше", "Інші витрати", "#795548", "📦", 1, None),
        ]
        
        current_time = datetime.now().isoformat()
        
        print("Додаю стандартні категорії...")
        for name, description, color, icon, is_default, user_id in default_categories:
            cursor.execute("""
                INSERT INTO categories (name, description, color, icon, is_default, created_at, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (name, description, color, icon, is_default, current_time, user_id))
        
        conn.commit()
        print(f"✅ Додано {len(default_categories)} стандартних категорій")
        

        cursor.execute("SELECT name, icon FROM categories WHERE is_default = 1;")
        categories = cursor.fetchall()
        print("\nСтворені категорії:")
        for name, icon in categories:
            print(f"  {icon} {name}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Помилка при заповненні БД: {e}")

def create_realistic_test_data():
    try:
        conn = sqlite3.connect('data.db')
        cursor = conn.cursor()
        

        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]
        
        if user_count > 0:
            print(f"Тестові користувачі вже існують ({user_count} шт.)")
            print("Використовуйте 'reset' для очищення БД перед створенням нових тестових даних")
            return
        
        print("🎭 Створюю реалістичні тестові дані...")
        

        cursor.execute("SELECT COUNT(*) FROM categories;")
        cat_count = cursor.fetchone()[0]
        if cat_count == 0:
            print("Спочатку створюю категорії...")
            seed_database()
        
        current_time = datetime.now().isoformat()
        

        test_users = [
            ("test@example.com", "Тестовий Користувач", "password123"),
            ("anna.ivanova@gmail.com", "Анна Іванова", "mypassword"),
            ("dmitry.petrov@outlook.com", "Дмитро Петров", "securepass"),
        ]
        
        print("👥 Створюю користувачів...")
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        user_ids = []
        for email, name, password in test_users:
            hashed_password = pwd_context.hash(password)
            cursor.execute("""
                INSERT INTO users (email, hashed_password, name, created_at, updated_at, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (email, hashed_password, name, current_time, current_time, True))
            user_ids.append(cursor.lastrowid)
        

        cursor.execute("SELECT id, name FROM categories;")
        categories = cursor.fetchall()
        category_map = {name: id for id, name in categories}
        

        print("💰 Створюю витрати...")
        

        realistic_expenses = {
            user_ids[0]: [
                (850, "Покупки в АТБ", "Продукти", -1),
                (1200, "Закупка на тиждень в Сільпо", "Продукти", -3),
                (450, "Хліб та молоко", "Продукти", -5),
                (2100, "Велика закупка продуктів", "Продукти", -7),
                (680, "Овочі на ринку", "Продукти", -10),
                
                (180, "Проїзд у метро", "Транспорт", -2),
                (350, "Таксі додому", "Транспорт", -4),
                (150, "Автобус", "Транспорт", -8),
                (200, "Маршрутка", "Транспорт", -12),
                
                (450, "Кіно з друзями", "Розваги", -6),
                (800, "Концерт", "Розваги", -15),
                (320, "Кафе", "Розваги", -9),
                
                (2500, "Курси програмування", "Освіта", -20),
                (450, "Підручники", "Освіта", -25),
                
                (150, "Канцтовари", "Інше", -11),
                (280, "Подарунок другу", "Інше", -18),
            ],
            
            user_ids[1]: [
                (1500, "Щотижнева закупка в Novus", "Продукти", -1),
                (2800, "Велика закупка в Metro", "Продукти", -7),
                (650, "Фрукти та овочі", "Продукти", -3),
                (1200, "Продукти на вихідні", "Продукти", -10),
                (890, "Дитяче харчування", "Продукти", -14),
                
                (1200, "Заправка автомобіля", "Транспорт", -2),
                (800, "Заправка", "Транспорт", -9),
                (450, "Парковка в центрі", "Транспорт", -5),
                
                (1800, "Візит до стоматолога", "Здоров'я", -12),
                (650, "Ліки в аптеці", "Здоров'я", -8),
                (2200, "Аналізи в клініці", "Здоров'я", -20),
                
                (3500, "Зимова куртка", "Одяг", -15),
                (1200, "Взуття для дитини", "Одяг", -22),
                (850, "Джинси", "Одяг", -30),
                
                (2100, "Комунальні платежі", "Комунальні", -1),
                (2050, "Комунальні платежі", "Комунальні", -31),
                (2180, "Комунальні платежі", "Комунальні", -61),
                
                (1200, "Сімейний похід в ресторан", "Розваги", -4),
                (650, "Дитячі розваги", "Розваги", -11),
                (2800, "Відпустка на вихідні", "Розваги", -25),
            ],
            
            user_ids[2]: [
                 (1800, "Закупка в Ашан", "Продукти", -2),
                 (950, "Продукти на тиждень", "Продукти", -9),
                 (1200, "Делікатеси", "Продукти", -16),
                 (750, "Сніданок в кафе", "Продукти", -4),
                 
                 (2500, "Техогляд автомобіля", "Транспорт", -18),
                 (1500, "Заправка", "Транспорт", -3),
                 (1200, "Заправка", "Транспорт", -12),
                 (350, "Таксі", "Транспорт", -6),
                 
                 (3200, "Ігрова консоль", "Розваги", -21),
                 (850, "Кіно IMAX", "Розваги", -7),
                 (1500, "Ресторан з колегами", "Розваги", -14),
                 (650, "Боулінг", "Розваги", -28),
                 
                 (4500, "Онлайн курс по AI", "Освіта", -35),
                 (1200, "Технічна література", "Освіта", -40),
                 
                 (15000, "Новий ноутбук", "Інше", -45),
                 (2800, "Навушники", "Інше", -50),
                 (450, "Кабелі та аксесуари", "Інше", -13),
            ]
        }
        
        for user_id, expenses in realistic_expenses.items():
            for amount, description, category_name, days_ago in expenses:
                expense_date = (datetime.now() + timedelta(days=days_ago)).strftime("%Y-%m-%d")
                category_id = category_map.get(category_name, 1)
                
                cursor.execute("""
                    INSERT INTO expenses (amount, description, category, category_id, date, created_at, updated_at, user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (amount, description, category_name, category_id, expense_date, current_time, current_time, user_id))
        
        print("📊 Створюю бюджети...")
        budgets_data = [
            (user_ids[0], "Продукти на місяць", 5000, 3280, "monthly", category_map["Продукти"]),
            (user_ids[0], "Розваги", 2000, 1570, "monthly", category_map["Розваги"]),
            (user_ids[1], "Сімейні продукти", 8000, 6940, "monthly", category_map["Продукти"]),
            (user_ids[1], "Транспорт", 3000, 2450, "monthly", category_map["Транспорт"]),
            (user_ids[1], "Комунальні", 2500, 2100, "monthly", category_map["Комунальні"]),
            (user_ids[2], "Розваги", 5000, 6200, "monthly", category_map["Розваги"]),
            (user_ids[2], "Освіта", 6000, 5700, "monthly", category_map["Освіта"]),
        ]
        
        start_date = datetime.now().replace(day=1).strftime("%Y-%m-%d")
        end_date = (datetime.now().replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        end_date = end_date.strftime("%Y-%m-%d")
        
        for user_id, name, amount, spent, period, category_id in budgets_data:
            cursor.execute("""
                INSERT INTO budgets (name, amount, spent, period, start_date, end_date, category_id, is_active, created_at, updated_at, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (name, amount, spent, period, start_date, end_date, category_id, True, current_time, current_time, user_id))
        
        print("🎯 Створюю цілі накопичень...")
        goals_data = [
            (user_ids[0], "Новий ноутбук", "Накопичити на ігровий ноутбук для навчання", 35000, 12500, "2024-06-01"),
            (user_ids[0], "Відпустка", "Поїздка до Європи влітку", 25000, 8300, "2024-07-15"),
            (user_ids[1], "Дитячий садок", "Оплата приватного дитячого садка", 50000, 32000, "2024-09-01"),
            (user_ids[1], "Сімейний автомобіль", "Накопичити на нову машину", 200000, 85000, "2025-03-01"),
            (user_ids[2], "Квартира", "Перший внесок за квартиру", 500000, 180000, "2025-12-31"),
            (user_ids[2], "Інвестиції", "Стартовий капітал для інвестицій", 100000, 45000, "2024-12-31"),
        ]
        
        for user_id, title, description, target_amount, current_amount, target_date in goals_data:
            is_achieved = current_amount >= target_amount
            cursor.execute("""
                INSERT INTO goals (title, description, target_amount, current_amount, target_date, is_achieved, created_at, updated_at, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (title, description, target_amount, current_amount, target_date, is_achieved, current_time, current_time, user_id))
        
        conn.commit()
        conn.close()
        
        print("✅ Реалістичні тестові дані створено!")
        print(f"👥 Користувачів: {len(test_users)}")
        print(f"💰 Витрат: {sum(len(expenses) for expenses in realistic_expenses.values())}")
        print(f"📊 Бюджетів: {len(budgets_data)}")
        print(f"🎯 Цілей: {len(goals_data)}")
        print("\n🔑 Тестові акаунти:")
        for email, name, password in test_users:
            print(f"  📧 {email} | 👤 {name} | 🔒 {password}")
        
    except Exception as e:
        print(f"❌ Помилка при створенні тестових даних: {e}")

def reset_database():
    try:
        conn = sqlite3.connect('data.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("🗑️ Очищення бази даних...")
        for table in tables:
            table_name = table[0]
            cursor.execute(f"DELETE FROM {table_name};")
            print(f"  ✅ Очищено таблицю: {table_name}")
        
        conn.commit()
        conn.close()
        
        print("✅ База даних очищена!")
        print("💡 Запустіть seed_database() для додавання стандартних категорій")
        
    except Exception as e:
        print(f"❌ Помилка при очищенні БД: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "check":
            check_database()
        elif command == "seed":
            seed_database()
        elif command == "test":
            create_realistic_test_data()
        elif command == "reset":
            reset_database()
        else:
            print("Доступні команди: check, seed, test, reset")
    else:
        print("Утиліти для роботи з БД:")
        print("  python utils.py check  - перевірити БД")
        print("  python utils.py seed   - заповнити початковими даними")
        print("  python utils.py test   - створити реалістичні тестові дані")
        print("  python utils.py reset  - очистити БД") 