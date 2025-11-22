# 🖥️ Daily Planner - Backend (API REST)

Backend en Flask para la aplicación Daily Planner con soporte para tareas periódicas.

---

## 🛠️ Tecnologías

- **Python 3.10+**
- **Flask 3.0.0** - Framework web
- **Flask-CORS 4.0.0** - Manejo de CORS
- **Flask-SQLAlchemy 3.1.1** - Integración Flask-SQLAlchemy
- **SQLAlchemy 2.0.44** - ORM
- **python-dateutil 2.8.2** - Manejo de fechas y recurrencias
- **SQLite** - Base de datos

---

## 📁 Estructura

```
server/
├── src/
│   ├── __init__.py
│   ├── app.py                # Aplicación principal Flask
│   ├── config/               # Configuración
│   ├── database/             # Configuración de base de datos
│   │   └── db.py            # Inicialización SQLAlchemy
│   ├── models/               # Modelos SQLAlchemy
│   │   └── task.py          # Modelo de tareas
│   ├── controllers/          # Lógica de negocio
│   │   └── task_controller.py
│   └── routes/               # Rutas de la API
│       └── task_routes.py   # Endpoints de tareas
├── tests/                    # Tests unitarios
│   └── test_periodic_tasks.py
├── instance/                 # Base de datos SQLite
│   └── daily_planner.db     # (generada automáticamente)
├── venv/                     # Entorno virtual
├── requirements.txt          # Dependencias
└── README.md                 # Este archivo
```

---

## 🚀 Instalación

### 1. Crear entorno virtual

```bash
cd server
python -m venv venv
```

### 2. Activar entorno virtual

**Linux/Mac:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Iniciar servidor

```bash
python src/app.py
```

El servidor estará disponible en: **http://localhost:5000**

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

### 📋 Tareas (Tasks)

#### Obtener todas las tareas
```http
GET /tasks/
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "titulo": "Reunión con equipo",
    "descripcion": "Revisar avances del proyecto",
    "fecha_inicio": "2025-11-10",
    "fecha_fin": "2025-11-10",
    "hora": "10:00:00",
    "completada": false,
    "prioridad": "alta",
    "tipo": "diaria",
    "color": "#1976d2",
    "group_id": null
  }
]
```

---

#### Obtener tarea por ID
```http
GET /tasks/<id>
```

**Ejemplo:**
```http
GET /tasks/1
```

---

#### Crear nueva tarea
```http
POST /tasks/
Content-Type: application/json
```

**Body (Tarea Simple):**
```json
{
  "titulo": "Nueva tarea",
  "descripcion": "Descripción opcional",
  "fecha_inicio": "2025-11-10",
  "fecha_fin": "2025-11-10",
  "hora": "14:30:00",
  "prioridad": "media",
  "tipo": "diaria",
  "color": "#1976d2"
}
```

**Body (Tarea Periódica):**
```json
{
  "titulo": "Ejercicio diario",
  "descripcion": "30 minutos de cardio",
  "fecha_inicio": "2025-11-10",
  "fecha_fin": "2025-11-10",
  "hora": "07:00:00",
  "prioridad": "alta",
  "color": "#ff5722",
  "recurrence": {
    "enabled": true,
    "frequency": "daily",
    "interval": 1,
    "endType": "count",
    "count": 30
  }
}
```

**Opciones de Recurrencia:**
- `frequency`: "daily", "weekly", "monthly", "yearly"
- `interval`: Número entero (cada N días/semanas/meses/años)
- `weekdays`: Array de días ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] (solo para weekly)
- `endType`: "date" o "count"
- `endDate`: Fecha límite (si endType es "date")
- `count`: Número de ocurrencias (si endType es "count")

**Respuesta:**
```json
{
  "message": "Tarea creada exitosamente",
  "task": { ... }
}
```

---

#### Actualizar tarea
```http
PUT /tasks/<id>
Content-Type: application/json
```

**Body:**
```json
{
  "titulo": "Tarea actualizada",
  "completada": true
}
```

---

#### Eliminar tarea
```http
DELETE /tasks/<id>
```

**Respuesta:**
```json
{
  "message": "Tarea eliminada exitosamente"
}
```

---

#### Eliminar grupo de tareas periódicas
```http
DELETE /tasks/group/<group_id>
```

**Descripción:** Elimina todas las tareas que pertenecen al mismo grupo periódico.

**Respuesta:**
```json
{
  "message": "5 tareas del grupo eliminadas exitosamente"
}
```

---

#### Cambiar estado de tarea (toggle)
```http
PATCH /tasks/<id>/toggle
```

**Respuesta:**
```json
{
  "message": "Estado de tarea actualizado",
  "task": { ... }
}
```

---

#### Obtener tareas pendientes
```http
GET /tasks/pending
```

**Respuesta:** Lista de tareas con `completada = false`

---

#### Obtener tareas por fecha
```http
GET /tasks/date/<fecha>
```

**Ejemplo:**
```http
GET /tasks/date/2025-11-10
```

---

## 🗄️ Modelo de Datos

### Task (Tarea)

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| id | Integer | ID único (auto-generado) | ✅ |
| titulo | String(200) | Título de la tarea | ✅ |
| descripcion | Text | Descripción detallada | ❌ |
| fecha_inicio | Date | Fecha de inicio de la tarea | ✅ |
| fecha_fin | Date | Fecha de fin de la tarea | ✅ |
| hora | Time | Hora específica | ❌ |
| completada | Boolean | Estado (default: false) | ✅ |
| prioridad | String(10) | alta, media, baja (default: media) | ✅ |
| tipo | String(15) | diaria, semanal (default: diaria) | ✅ |
| color | String(7) | Color en formato hex (default: #1976d2) | ✅ |
| group_id | String(36) | UUID para agrupar tareas periódicas | ❌ |
| created_at | DateTime | Fecha de creación (auto) | ✅ |
| updated_at | DateTime | Fecha de actualización (auto) | ✅ |

---

## ⚙️ Configuración

### Variables de Entorno (Opcional)

Crea un archivo `.env` en el directorio `server/`:

```env
FLASK_APP=src/app.py
FLASK_ENV=development
DATABASE_URL=sqlite:///daily_planner.db
SECRET_KEY=tu-clave-secreta-aqui
```

---

## 🔒 CORS

CORS está habilitado para todas las rutas por defecto:

```python
CORS(app)
```

Para restringir orígenes específicos:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"]
    }
})
```

---

## 🗃️ Base de Datos

### SQLite

- **Ubicación:** `server/instance/daily_planner.db`
- **Creación:** Automática al iniciar el servidor
- **Migraciones:** Se crean tablas automáticamente con `db.create_all()`

### Resetear Base de Datos

```bash
# Detener el servidor
# Eliminar la base de datos
rm -rf instance/daily_planner.db

# Reiniciar el servidor (se creará nueva BD)
python src/app.py
```

---

## 🧪 Testing

### Ejecutar Tests Unitarios

```bash
# Desde el directorio server/
python -m pytest tests/

# Con verbose
python -m pytest tests/ -v

# Test específico
python -m pytest tests/test_periodic_tasks.py
```

### Tests Disponibles

#### 1. Tareas Periódicas (`test_periodic_tasks.py`)
- Creación de tareas diarias recurrentes
- Creación de tareas semanales con días específicos
- Validación de fechas generadas y `group_id`

#### 2. Rutas API (`test_routes.py`)
- `GET /tasks/`: Listado de tareas (vacío y con datos)
- `POST /tasks/`: Creación de tareas y validación de respuesta
- `GET /tasks/<id>`: Obtención de tarea individual
- `PUT /tasks/<id>`: Actualización de campos
- `DELETE /tasks/<id>`: Eliminación y verificación
- `PATCH /tasks/<id>/toggle`: Cambio de estado completado

#### 3. Modelos (`test_models.py`)
- Creación de tareas con campos obligatorios
- Validación de valores por defecto (prioridad, color, tipo)
- Serialización `to_dict()`
- Persistencia en base de datos

---

## 🐛 Debugging

### Modo Debug

El servidor corre en modo debug por defecto:

```python
app.run(debug=True, host='0.0.0.0', port=5000)
```

### Logs

Los logs se muestran en la consola:
- Requests HTTP
- Errores de la aplicación
- Queries SQL (con debug activado)

---

## 🧪 Testing con curl

### Probar endpoints con curl

```bash
# Obtener todas las tareas
curl http://localhost:5000/api/tasks/

# Health check
curl http://localhost:5000/api/health

# Crear una tarea simple
curl -X POST http://localhost:5000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Test",
    "fecha_inicio": "2025-11-10",
    "fecha_fin": "2025-11-10",
    "prioridad": "alta",
    "tipo": "diaria"
  }'

# Crear tarea periódica (5 días)
curl -X POST http://localhost:5000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Ejercicio",
    "fecha_inicio": "2025-11-10",
    "fecha_fin": "2025-11-10",
    "recurrence": {
      "enabled": true,
      "frequency": "daily",
      "interval": 1,
      "endType": "count",
      "count": 5
    }
  }'

# Actualizar tarea
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completada": true}'

# Eliminar tarea
curl -X DELETE http://localhost:5000/api/tasks/1

# Eliminar grupo de tareas periódicas
curl -X DELETE http://localhost:5000/api/tasks/group/abc-123-def
```

---

## 📦 Dependencias

Ver `requirements.txt`:

```
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
SQLAlchemy==2.0.44
python-dateutil==2.8.2
python-dotenv==1.0.0
psycopg==3.2.12
psycopg-binary==3.2.12
```

### Instalar dependencia adicional

```bash
pip install nombre-paquete
pip freeze > requirements.txt
```

---

## 🚀 Despliegue

### Producción

Para producción, usa un servidor WSGI como **Gunicorn**:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.app:app
```

### Docker (Opcional)

Ejemplo de `Dockerfile`:

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
CMD ["python", "src/app.py"]
```

---

## 📝 Notas

- El servidor recarga automáticamente al detectar cambios (modo debug)
- Los datos persisten en `instance/daily_planner.db`
- CORS configurado para `http://localhost:3000`
- Health check disponible en `/api/health`
- Soporte completo para tareas periódicas con `python-dateutil`
- Tests unitarios disponibles en `tests/`
