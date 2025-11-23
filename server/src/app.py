from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from database.db import db, init_db
import os
import sys
from pathlib import Path

def get_data_directory():
    """
    Get the appropriate data directory for the application based on the OS.
    Returns a Path object to the data directory.
    """
    if sys.platform == 'win32':
        # Windows: %APPDATA%/daily-planner
        data_dir = Path(os.environ.get('APPDATA', '~')) / 'daily-planner'
    elif sys.platform == 'darwin':
        # macOS: ~/Library/Application Support/daily-planner
        data_dir = Path.home() / 'Library' / 'Application Support' / 'daily-planner'
    else:
        # Linux: ~/.local/share/daily-planner
        data_dir = Path.home() / '.local' / 'share' / 'daily-planner'
    
    # Create directory if it doesn't exist
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir

def create_app(test_config=None):
    app = Flask(__name__)
    
    if test_config is None:
        # Get data directory
        data_dir = get_data_directory()
        db_path = data_dir / 'daily_planner.db'
        
        # Configuración de la base de datos
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        print(f"[DATA] Data directory: {data_dir}")
        print(f"[DB] Database: {db_path}")
    else:
        # Load test config
        app.config.update(test_config)

    
    # Inicializar base de datos
    db.init_app(app)
    
    # Inicializar migraciones
    migrate = Migrate(app, db)
    
    # Habilitar CORS para todas las rutas
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Crear tablas si no existen (DENTRO del contexto de la app)
    # with app.app_context():
    #     init_db()
    
    # Registrar blueprints
    from routes.task_routes import task_bp
    app.register_blueprint(task_bp, url_prefix='/api/tasks')
    
    # Ruta de prueba
    @app.route('/')
    def index():
        return {'message': 'Daily Planner API', 'status': 'running'}
    
    # Ruta de prueba para verificar conexión
    @app.route('/api/health')
    def health():
        try:
            # Intentar hacer una consulta simple
            from models.task import Task
            count = Task.query.count()
            return {
                'status': 'ok',
                'database': 'connected',
                'tasks_count': count
            }, 200
        except Exception as e:
            return {
                'status': 'error',
                'database': 'disconnected',
                'error': str(e)
            }, 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("\n" + "="*50)
    print("[OK] Servidor iniciado en http://127.0.0.1:5000")
    print("[CORS] CORS habilitado para http://localhost:3000")
    print("[HEALTH] Health check: http://127.0.0.1:5000/api/health")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)