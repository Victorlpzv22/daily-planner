from flask import Flask
from flask_cors import CORS
from database.db import connect_to_database, disconnect_from_database
from dotenv import load_dotenv
import os

# Cargar variables de entorno según el entorno
env = os.getenv('ENVIRONMENT', 'development')
env_file = f'.env.{env}' if env in ['development', 'production'] else '.env'
load_dotenv(env_file)

def create_app():
    app = Flask(__name__)
    
    # Configuración de CORS (permitir peticiones desde el cliente)
    CORS(app)
    
    # Configuración desde variables de entorno
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # Conectar a la base de datos
    connect_to_database(app)
    
    # Registrar blueprints (rutas) aquí cuando las creemos
    # from routes.task_routes import task_bp
    # app.register_blueprint(task_bp, url_prefix='/api')
    
    # Ruta de prueba
    @app.route('/')
    def index():
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
        db_type = 'SQLite' if 'sqlite' in db_uri else 'PostgreSQL'
        
        return {
            'message': 'Daily Planner API',
            'status': 'running',
            'version': '1.0.0',
            'environment': env,
            'database': db_type
        }
    
    @app.route('/health')
    def health():
        return {'status': 'healthy'}, 200
    
    # Cleanup al cerrar
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        disconnect_from_database()
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)