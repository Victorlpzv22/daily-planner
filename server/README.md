# 🖥️ Daily Planner - Backend (API REST)

Backend en Flask para la aplicación Daily Planner.

---

## 🛠️ Tecnologías

- **Python 3.10+**
- **Flask 3.0.0** - Framework web
- **Flask-CORS 4.0.0** - Manejo de CORS
- **SQLAlchemy 2.0.23** - ORM
- **SQLite** - Base de datos

---

## 📁 Estructura

```
server/
├── src/
│   ├── app.py           # Aplicación principal Flask
│   ├── models.py        # Modelos SQLAlchemy
│   └── routes/
│       └── tasks.py     # Rutas de la API
├── venv/                # Entorno virtual
├── daily_planner.db     # Base de datos SQLite (generada automáticamente)
├── requirements.txt     # Dependencias
└── README.md            # Este archivo
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
    "fecha": "2025-11-10",
    "hora": "10:00:00",
    "completada": false,
    "prioridad": "alta",
    "tipo": "diaria"
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

**Body:**
```json
{
  "titulo": "Nueva tarea",
  "descripcion": "Descripción opcional",
  "fecha": "2025-11-10",
  "hora": "14:30:00",
  "prioridad": "media",
  "tipo": "diaria"
}
```

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
| fecha | Date | Fecha de la tarea | ✅ |
| hora | Time | Hora específica | ❌ |
| completada | Boolean | Estado (default: false) | ✅ |
| prioridad | String(10) | alta, media, baja (default: media) | ✅ |
| tipo | String(10) | diaria, semanal (default: diaria) | ✅ |

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

- **Ubicación:** `server/daily_planner.db`
- **Creación:** Automática al iniciar el servidor
- **Migraciones:** Se crean tablas automáticamente con `db.create_all()`

### Resetear Base de Datos

```bash
# Detener el servidor
# Eliminar la base de datos
rm daily_planner.db

# Reiniciar el servidor (se creará nueva BD)
python src/app.py
```

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

## 🧪 Testing

### Probar endpoints con curl

```bash
# Obtener todas las tareas
curl http://localhost:5000/api/tasks/

# Crear una tarea
curl -X POST http://localhost:5000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Test",
    "fecha": "2025-11-10",
    "prioridad": "alta",
    "tipo": "diaria"
  }'

# Actualizar tarea
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completada": true}'

# Eliminar tarea
curl -X DELETE http://localhost:5000/api/tasks/1
```

---

## 📦 Dependencias

Ver `requirements.txt`:

```
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
SQLAlchemy==2.0.23
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
- Los datos persisten en `daily_planner.db`
- CORS está configurado para desarrollo (permite todos los orígenes)
