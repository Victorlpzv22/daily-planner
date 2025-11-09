# Daily Planner - Backend API

API REST desarrollada con Flask para gestionar tareas de la aplicación Daily Planner.

## 📋 Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Base de Datos](#base-de-datos)
- [Desarrollo](#desarrollo)
- [Testing](#testing)

## 🛠️ Tecnologías

- **Python**: 3.13
- **Flask**: 3.0.0 - Framework web
- **Flask-SQLAlchemy**: 3.1.1 - ORM para base de datos
- **psycopg**: 3.1.0+ - Driver PostgreSQL
- **python-dotenv**: 1.0.0 - Gestión de variables de entorno
- **Flask-CORS**: 4.0.0 - Manejo de CORS
- **PostgreSQL**: 15 - Base de datos relacional

## 📦 Instalación

### Prerrequisitos

- Python 3.8 o superior
- Docker y Docker Compose
- pip (gestor de paquetes Python)

### Pasos

1. **Crear entorno virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
```

2. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env.development
```

Edita `.env.development`:
```bash
ENVIRONMENT=development
SECRET_KEY=tu-clave-secreta-aqui
DATABASE_URL=postgresql+psycopg://daily_user:daily_pass@localhost:5432/daily_planner
FLASK_DEBUG=True
PORT=5000
```

4. **Levantar PostgreSQL con Docker:**
```bash
docker-compose up -d
```

5. **Verificar que PostgreSQL está corriendo:**
```bash
docker-compose ps
```

6. **Ejecutar el servidor:**
```bash
python src/app.py
```

El servidor estará disponible en `http://localhost:5000`

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `ENVIRONMENT` | Entorno de ejecución | `development` / `production` |
| `SECRET_KEY` | Clave secreta de Flask | `your-secret-key-here` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql+psycopg://user:pass@host:port/db` |
| `FLASK_DEBUG` | Modo debug de Flask | `True` / `False` |
| `PORT` | Puerto del servidor | `5000` |

### Archivos de Configuración

- `.env.development` - Configuración para desarrollo local
- `.env.production` - Configuración para producción
- `.env.example` - Plantilla de variables de entorno

**⚠️ IMPORTANTE:** Nunca subas archivos `.env.*` a Git. Ya están incluidos en `.gitignore`.

## 📁 Estructura del Proyecto

```
server/
├── src/
│   ├── __init__.py
│   ├── app.py                    # Aplicación Flask principal
│   ├── database/
│   │   ├── __init__.py
│   │   └── db.py                 # Configuración de la base de datos
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py               # Modelo Task
│   ├── controllers/              # (Por implementar)
│   │   ├── __init__.py
│   │   └── task_controller.py
│   └── routes/                   # (Por implementar)
│       ├── __init__.py
│       └── task_routes.py
├── tests/                        # Tests unitarios
│   ├── __init__.py
│   └── test_tasks.py
├── venv/                         # Entorno virtual (no subir a Git)
├── .env.development              # Variables de entorno dev (no subir)
├── .env.production               # Variables de entorno prod (no subir)
├── .env.example                  # Plantilla de variables (SÍ subir)
├── .gitignore                    # Archivos ignorados por Git
├── docker-compose.yml            # Configuración de PostgreSQL
├── requirements.txt              # Dependencias Python
└── README.md                     # Este archivo
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints Implementados

#### Healthcheck
```http
GET /health
```
**Respuesta:**
```json
{
  "status": "healthy"
}
```

#### Información de la API
```http
GET /
```
**Respuesta:**
```json
{
  "message": "Daily Planner API",
  "status": "running",
  "version": "1.0.0",
  "environment": "development"
}
```

### Endpoints de Tareas (Por Implementar)

#### Listar todas las tareas
```http
GET /api/tasks
```

#### Obtener una tarea específica
```http
GET /api/tasks/:id
```

#### Crear una nueva tarea
```http
POST /api/tasks
Content-Type: application/json

{
  "titulo": "Tarea de ejemplo",
  "descripcion": "Descripción detallada",
  "fecha": "2025-11-10",
  "hora": "14:30:00",
  "prioridad": "alta",
  "tipo": "diaria"
}
```

#### Actualizar una tarea
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "titulo": "Tarea actualizada",
  "completada": true
}
```

#### Eliminar una tarea
```http
DELETE /api/tasks/:id
```

## 📊 Modelos de Datos

### Task (Tarea)

```python
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False, index=True)
    descripcion = db.Column(db.Text, nullable=True)
    fecha = db.Column(db.Date, nullable=False, index=True)
    hora = db.Column(db.Time, nullable=True)
    completada = db.Column(db.Boolean, default=False, index=True)
    prioridad = db.Column(db.String(20), default='media')  # alta, media, baja
    tipo = db.Column(db.String(20), default='diaria')      # diaria, semanal
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
```

#### Campos

| Campo | Tipo | Descripción | Requerido | Por Defecto |
|-------|------|-------------|-----------|-------------|
| `id` | Integer | Identificador único | Sí (auto) | - |
| `titulo` | String(200) | Título de la tarea | Sí | - |
| `descripcion` | Text | Descripción detallada | No | null |
| `fecha` | Date | Fecha de la tarea | Sí | - |
| `hora` | Time | Hora específica | No | null |
| `completada` | Boolean | Si está completada | No | false |
| `prioridad` | String(20) | Nivel de prioridad | No | 'media' |
| `tipo` | String(20) | Tipo de tarea | No | 'diaria' |
| `created_at` | DateTime | Fecha de creación | No | now() |
| `updated_at` | DateTime | Última actualización | No | now() |

#### Valores Permitidos

- **prioridad**: `alta`, `media`, `baja`
- **tipo**: `diaria`, `semanal`

## 🗄️ Base de Datos

### PostgreSQL con Docker

El proyecto usa PostgreSQL 15 ejecutándose en un contenedor Docker.

#### Configuración (docker-compose.yml)

```yaml
services:
  db:
    image: postgres:15
    container_name: daily-planner-db
    environment:
      POSTGRES_USER: daily_user
      POSTGRES_PASSWORD: daily_pass
      POSTGRES_DB: daily_planner
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

#### Comandos Útiles

```bash
# Levantar base de datos
docker-compose up -d

# Ver logs
docker-compose logs -f db

# Parar base de datos (datos persisten)
docker-compose down

# Parar y eliminar datos (⚠️ CUIDADO)
docker-compose down -v

# Conectarse a PostgreSQL
docker-compose exec db psql -U daily_user -d daily_planner

# Backup de la base de datos
docker-compose exec db pg_dump -U daily_user daily_planner > backup.sql

# Restaurar desde backup
docker-compose exec -T db psql -U daily_user daily_planner < backup.sql
```

### Persistencia de Datos

Los datos se guardan en un **volumen de Docker** (`postgres_data`), por lo que:
- ✅ Persisten al reiniciar el contenedor
- ✅ Persisten al reiniciar el sistema
- ❌ Se pierden solo si ejecutas `docker-compose down -v`

## 💻 Desarrollo

### Ejecutar en modo desarrollo

```bash
# Activar entorno virtual
source venv/bin/activate

# Levantar PostgreSQL
docker-compose up -d

# Ejecutar servidor
python src/app.py
```

El servidor se recargará automáticamente al detectar cambios (modo debug).

### Ejecutar en modo producción

```bash
ENVIRONMENT=production python src/app.py
```

### Estructura de una Feature

1. Crear modelo en `models/`
2. Crear controlador en `controllers/`
3. Crear rutas en `routes/`
4. Registrar blueprint en `app.py`
5. Crear tests en `tests/`

## 🧪 Testing

```bash
# Instalar pytest
pip install pytest pytest-flask

# Ejecutar tests
pytest tests/

# Con coverage
pytest --cov=src tests/
```

## 🐛 Troubleshooting

### Error: "No module named 'psycopg2'"

**Solución:** Asegúrate de usar `postgresql+psycopg://` en la DATABASE_URL, no `postgresql://`

### Error: "Connection refused to localhost:5432"

**Solución:** 
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Si no está corriendo, levantarlo
docker-compose up -d
```

### Error: "DATABASE_URL no está configurada"

**Solución:** Verifica que existe `.env.development` con la variable DATABASE_URL

## 📚 Recursos

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🚀 Roadmap

- [x] Configuración inicial del proyecto
- [x] Modelo Task
- [x] Conexión con PostgreSQL
- [ ] CRUD completo de tareas
- [ ] Filtros y búsqueda
- [ ] Autenticación JWT
- [ ] Tests unitarios
- [ ] Documentación con Swagger
- [ ] Deploy a producción

---

Desarrollado con ❤️ por Victor