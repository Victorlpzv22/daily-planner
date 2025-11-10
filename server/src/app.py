from flask import Flask
from flask_cors import CORS
from database.db import db, init_db
import os

def create_app():
    app = Flask(__name__)
    
    # Configuración de la base de datos
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "daily_planner.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializar base de datos
    db.init_app(app)
    
    # Habilitar CORS para todas las rutas
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Crear tablas si no existen (DENTRO del contexto de la app)
    with app.app_context():
        init_db()
    
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
    print("✅ Servidor iniciado en http://127.0.0.1:5000")
    print("📡 CORS habilitado para http://localhost:3000")
    print("🔍 Health check: http://127.0.0.1:5000/api/health")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)