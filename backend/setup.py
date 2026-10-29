#!/usr/bin/env python
"""
Quick setup script for Jupiter School ERP.
Run once after cloning: python setup.py
"""
import subprocess, sys, os

BASE = os.path.dirname(os.path.abspath(__file__))

def run(cmd, **kwargs):
    print(f"\n▶ {cmd}")
    result = subprocess.run(cmd, shell=True, **kwargs)
    return result.returncode == 0

print("=" * 60)
print("  Jupiter English Medium School ERP — Quick Setup")
print("=" * 60)

# 1. Install Python dependencies
print("\n📦 Installing Python packages...")
if not run(f"{sys.executable} -m pip install -r requirements.txt", cwd=BASE):
    print("❌ Failed to install Python packages.")
    sys.exit(1)

# 2. Run migrations (creates DB schema)
print("\n🗄️  Running database migrations...")
if not run(f"{sys.executable} manage.py migrate", cwd=BASE):
    print("❌ Migration failed.")
    sys.exit(1)

# 3. Seed demo data
print("\n🌱 Seeding demo data...")
if not run(f"{sys.executable} manage.py seed_data", cwd=BASE):
    print("⚠️  Seed data failed (may already exist — continuing).")

# 4. Done
print("\n" + "=" * 60)
print("  ✅ Setup complete!")
print("=" * 60)
print("\n▶ Start backend:  python manage.py runserver")
print("▶ Backend URL:    http://localhost:8000")
print("▶ API Docs:       http://localhost:8000/api/docs/")
print("▶ Admin panel:    http://localhost:8000/admin/")
print("\n▶ Start frontend (in separate terminal):")
print("    cd ../frontend && npm install && npm start")
print("▶ Frontend URL:   http://localhost:4200")
print("\n💡 Set your Gemini API key in backend/.env.example → .env")
print("   Get a free key at: https://aistudio.google.com/\n")
