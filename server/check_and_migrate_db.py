#!/usr/bin/env python3
"""
Script para verificar y actualizar el esquema de la base de datos
"""
import sqlite3
import os

# Ruta a la base de datos
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'daily_planner.db')

print(f"Conectando a la base de datos: {db_path}")

# Conectar a la base de datos
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Listar todas las tablas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"\nTablas encontradas: {[t[0] for t in tables]}")
    
    if not tables:
        print("\n⚠️ No hay tablas en la base de datos")
        print("El servidor debe crear las tablas al iniciar")
    else:
        # Verificar la estructura de la tabla tasks
        cursor.execute("PRAGMA table_info(tasks)")
        columns = cursor.fetchall()
        
        print("\nColumnas en la tabla 'tasks':")
        column_names = []
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
            column_names.append(col[1])
        
        # Verificar si existe group_id
        if 'group_id' not in column_names:
            print("\n⚠️ La columna 'group_id' no existe. Agregándola...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN group_id VARCHAR(36)")
            conn.commit()
            print("✓ Columna 'group_id' agregada exitosamente")
        else:
            print("\n✓ La columna 'group_id' ya existe")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    conn.close()
    print("\nConexión cerrada")
