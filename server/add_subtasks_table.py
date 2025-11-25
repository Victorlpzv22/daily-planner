#!/usr/bin/env python3
"""
Script para agregar la tabla subtasks a la base de datos
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
    # Crear tabla subtasks
    print("\nCreando tabla 'subtasks'...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subtasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        completada BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    )
    """)
    conn.commit()
    print("✓ Tabla 'subtasks' creada exitosamente")
    
    # Verificar que se creó correctamente
    cursor.execute("PRAGMA table_info(subtasks)")
    columns = cursor.fetchall()
    print("\nColumnas en la tabla 'subtasks':")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")

except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    conn.close()
    print("\nConexión cerrada")
