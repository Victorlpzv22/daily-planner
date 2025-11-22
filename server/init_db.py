#!/usr/bin/env python3
"""
Script para inicializar la base de datos manualmente
"""
import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from app import create_app
from database.db import db
from models.task import Task

print("Creando aplicación...")
app = create_app()

print("Inicializando base de datos...")
with app.app_context():
    # Eliminar todas las tablas
    db.drop_all()
    print("✓ Tablas eliminadas")
    
    # Crear todas las tablas
    db.create_all()
    print("✓ Tablas creadas")
    
    # Verificar
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"\nTablas en la base de datos: {tables}")
    
    if 'tasks' in tables:
        columns = inspector.get_columns('tasks')
        print("\nColumnas en la tabla 'tasks':")
        for col in columns:
            print(f"  - {col['name']} ({col['type']})")

print("\n✓ Base de datos inicializada correctamente")
