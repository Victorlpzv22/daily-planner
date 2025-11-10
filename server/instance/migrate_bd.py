#!/usr/bin/env python3
"""
Script para migrar la base de datos de 'fecha' a 'fecha_inicio' y 'fecha_fin'
"""
import sqlite3
from datetime import datetime, timedelta
import os

# Ajustar ruta según donde esté tu BD
DB_PATH = os.path.join(os.path.dirname(__file__), 'daily_planner.db')

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"❌ No se encontró la base de datos en: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 Iniciando migración...")
        
        # Verificar si ya tiene las columnas nuevas
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'fecha_inicio' in columns and 'fecha_fin' in columns:
            print("✅ La base de datos ya está migrada")
            return
        
        print("📋 Columnas actuales:", columns)
        
        # 1. Crear tabla temporal con nueva estructura
        cursor.execute('''
            CREATE TABLE tasks_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo VARCHAR(200) NOT NULL,
                descripcion TEXT,
                fecha_inicio DATE NOT NULL,
                fecha_fin DATE NOT NULL,
                hora TIME,
                completada BOOLEAN DEFAULT 0,
                prioridad VARCHAR(10) DEFAULT 'media',
                tipo VARCHAR(15) DEFAULT 'diaria',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("✅ Tabla temporal creada")
        
        # 2. Copiar datos existentes
        cursor.execute('SELECT * FROM tasks')
        old_tasks = cursor.fetchall()
        
        print(f"📊 Migrando {len(old_tasks)} tareas...")
        
        for task in old_tasks:
            # Ajusta los índices según tu tabla actual
            # Formato típico: id, titulo, descripcion, fecha, hora, completada, prioridad, tipo
            task_id = task[0]
            titulo = task[1]
            descripcion = task[2] if len(task) > 2 else None
            fecha_old = task[3] if len(task) > 3 else datetime.now().strftime('%Y-%m-%d')
            hora = task[4] if len(task) > 4 else None
            completada = task[5] if len(task) > 5 else False
            prioridad = task[6] if len(task) > 6 else 'media'
            tipo = task[7] if len(task) > 7 else 'diaria'
            
            # Convertir fecha antigua a fecha_inicio y fecha_fin
            fecha = datetime.strptime(fecha_old, '%Y-%m-%d').date()
            
            if tipo == 'semanal':
                # Para semanales: inicio = fecha, fin = fecha + 6 días
                fecha_inicio = fecha
                fecha_fin = fecha + timedelta(days=6)
            else:
                # Para diarias: inicio = fin = fecha
                fecha_inicio = fecha
                fecha_fin = fecha
            
            cursor.execute('''
                INSERT INTO tasks_new 
                (titulo, descripcion, fecha_inicio, fecha_fin, hora, completada, prioridad, tipo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (titulo, descripcion, fecha_inicio, fecha_fin, hora, completada, prioridad, tipo))
            
            print(f"  ✓ Tarea {task_id}: {titulo[:30]}...")
        
        print(f"✅ {len(old_tasks)} tareas migradas")
        
        # 3. Eliminar tabla antigua y renombrar
        cursor.execute('DROP TABLE tasks')
        cursor.execute('ALTER TABLE tasks_new RENAME TO tasks')
        print("✅ Tabla renombrada")
        
        conn.commit()
        print("🎉 Migración completada exitosamente")
        print(f"\n📁 Base de datos: {DB_PATH}")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()