from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def connect_to_database(app):
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        raise ValueError("DATABASE_URL no está configurada en las variables de entorno")
    
    # Ajustar URL para PostgreSQL con psycopg3
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql+psycopg://', 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = os.getenv('FLASK_DEBUG', 'False') == 'True'
    
    db.init_app(app)
    
    with app.app_context():
        # ⚠️ IMPORTANTE: Importar modelos ANTES de create_all()
        from models.task import Task
        
        db.create_all()
        
        # Mostrar qué base de datos estamos usando
        if 'sqlite' in database_url:
            print(f"✓ Conectado a SQLite: daily_planner.db")
        else:
            print(f"✓ Conectado a PostgreSQL")

def disconnect_from_database():
    db.session.remove()