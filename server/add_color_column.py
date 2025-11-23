#!/usr/bin/env python3
"""
Script para añadir columna 'color' a la tabla tasks
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'daily_planner.db')

# Colores por defecto según prioridad
DEFAULT_COLORS = {
    'alta': '#d32f2f',    # Rojo
    'media': '#ed6c02',   # Naranja
    'baja': '#2e7d32',    # Verde
}

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"❌ No se encontró la base de datos en: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Verificar si ya tiene la columna
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'color' in columns:
            print("✅ La columna 'color' ya existe")
            return
        
        print("🔄 Añadiendo columna 'color' a la tabla tasks...")
        
        # Añadir columna con valor por defecto
        cursor.execute("ALTER TABLE tasks ADD COLUMN color VARCHAR(7) DEFAULT '#1976d2'")
        
        # Actualizar colores según prioridad existente
        print("🎨 Asignando colores según prioridad...")
        for prioridad, color in DEFAULT_COLORS.items():
            cursor.execute(
                "UPDATE tasks SET color = ? WHERE prioridad = ?",
                (color, prioridad)
            )
            count = cursor.rowcount
            print(f"  ✓ {count} tareas de prioridad '{prioridad}' → {color}")
        
        conn.commit()
        print("🎉 Migración completada exitosamente")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()