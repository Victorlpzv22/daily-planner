#!/usr/bin/env python3
"""
Script para agregar la columna group_id a la tabla tasks
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
    # Verificar si la columna ya existe
    cursor.execute("PRAGMA table_info(tasks)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'group_id' in columns:
        print("✓ La columna 'group_id' ya existe en la tabla 'tasks'")
    else:
        # Agregar la columna group_id
        print("Agregando columna 'group_id' a la tabla 'tasks'...")
        cursor.execute("ALTER TABLE tasks ADD COLUMN group_id VARCHAR(36)")
        conn.commit()
        print("✓ Columna 'group_id' agregada exitosamente")
    
    # Verificar el resultado
    cursor.execute("PRAGMA table_info(tasks)")
    columns = cursor.fetchall()
    print("\nColumnas en la tabla 'tasks':")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
    
except Exception as e:
    print(f"✗ Error: {e}")
    conn.rollback()
finally:
    conn.close()
    print("\nConexión cerrada")
