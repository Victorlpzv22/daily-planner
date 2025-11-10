# 📅 Daily Planner - Aplicación de Gestión de Tareas

Aplicación web full-stack para gestionar tareas diarias y semanales con calendario interactivo.

## 🚀 Características

### ✨ Gestión de Tareas
- ✅ Crear, editar y eliminar tareas
- ✅ Marcar tareas como completadas
- ✅ Establecer prioridades (Alta, Media, Baja)
- ✅ Tipos de tareas: Diarias y Semanales
- ✅ Añadir fecha, hora y descripción
- ✅ Filtrar por estado (Todas, Pendientes, Completadas)

### 📊 Visualizaciones
- **Vista Lista**: Lista tradicional de tareas con filtros
- **Vista Calendario Mensual (Días)**: Calendario que muestra tareas por día
  - Tareas diarias aparecen en su día específico
  - Tareas semanales aparecen en todos los días de esa semana
- **Vista Calendario Mensual (Semanas)**: Tareas agrupadas por semanas

### 🎨 Interfaz
- Diseño moderno y responsivo
- Código de colores por prioridad
- Navegación intuitiva entre vistas
- Indicadores visuales para tareas semanales
- Calendario interactivo

---

## 🛠️ Tecnologías

### Backend
- **Python 3.10+**
- **Flask** - Framework web
- **SQLAlchemy** - ORM para base de datos
- **Flask-CORS** - Manejo de CORS
- **SQLite** - Base de datos

### Frontend
- **React 19** - Biblioteca UI
- **Axios** - Cliente HTTP
- **date-fns** - Manejo de fechas
- **React Icons** - Iconos
- **CSS3** - Estilos personalizados

---

## 📁 Estructura del Proyecto

```
daily-planner/
├── server/                 # Backend (Flask)
│   ├── src/
│   │   ├── app.py         # Aplicación principal
│   │   ├── models.py      # Modelos de datos
│   │   └── routes/
│   │       └── tasks.py   # Rutas API
│   ├── venv/              # Entorno virtual Python
│   ├── requirements.txt   # Dependencias Python
│   └── README.md          # Documentación del servidor
│
├── client/                # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # Servicios API
│   │   ├── styles/        # Archivos CSS
│   │   └── App.js         # Componente principal
│   ├── package.json       # Dependencias Node
│   └── README.md          # Documentación del cliente
│
└── README.md              # Este archivo
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.10 o superior
- Node.js 14 o superior
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd daily-planner
```

### 2. Configurar el Backend

```bash
cd server

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
python src/app.py
```

El servidor estará corriendo en **http://localhost:5000**

### 3. Configurar el Frontend

```bash
cd client

# Instalar dependencias
npm install

# Crear archivo .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Iniciar aplicación
npm start
```

La aplicación estará disponible en **http://localhost:3000**

---

## 📖 Uso

### Crear una Tarea
1. Click en **"+ Nueva Tarea"**
2. Completa el formulario:
   - **Título** (obligatorio)
   - **Descripción** (opcional)
   - **Fecha** (obligatoria)
   - **Hora** (opcional)
   - **Prioridad**: Alta, Media o Baja
   - **Tipo**: Diaria o Semanal
3. Click en **"Crear Tarea"**

### Gestionar Tareas
- ✏️ **Editar**: Click en el icono de lápiz
- 🗑️ **Eliminar**: Click en el icono de papelera
- ☑️ **Completar**: Click en el checkbox

### Cambiar Vista
- **Lista**: Ver todas las tareas en formato lista
- **Mes (Días)**: Ver tareas en calendario mensual por días
- **Mes (Semanas)**: Ver tareas agrupadas por semanas

### Filtros (Solo en Vista Lista)
- **Todas**: Muestra todas las tareas
- **Pendientes**: Solo tareas no completadas
- **Completadas**: Solo tareas completadas

---

## 🎯 API Endpoints

### Tareas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks/` | Obtener todas las tareas |
| GET | `/api/tasks/<id>` | Obtener tarea por ID |
| POST | `/api/tasks/` | Crear nueva tarea |
| PUT | `/api/tasks/<id>` | Actualizar tarea |
| DELETE | `/api/tasks/<id>` | Eliminar tarea |
| PATCH | `/api/tasks/<id>/toggle` | Cambiar estado completada |
| GET | `/api/tasks/pending` | Obtener tareas pendientes |
| GET | `/api/tasks/date/<fecha>` | Obtener tareas por fecha |

---

## 🎨 Características Visuales

### Código de Colores por Prioridad
- 🔴 **Alta**: Rojo
- 🟡 **Media**: Amarillo
- 🟢 **Baja**: Verde

### Indicadores
- 📅 Badge para tareas semanales
- 🕐 Icono de reloj para tareas con hora
- ✅ Checkbox para marcar completadas
- ↻ Borde punteado para tareas semanales en calendario

---

## 🐛 Solución de Problemas

### El frontend no se conecta al backend
1. Verifica que el servidor backend está corriendo en el puerto 5000
2. Verifica el archivo `.env` en `client/`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
3. Reinicia el servidor React después de cambiar `.env`

### Errores de CORS
- El backend tiene CORS habilitado por defecto
- Si persiste, verifica `app.py` línea con `CORS(app)`

### "react-scripts: command not found"
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Notas de Desarrollo

### Base de Datos
- SQLite almacenada en `server/daily_planner.db`
- Se crea automáticamente al iniciar el servidor
- Para resetear: elimina el archivo `.db` y reinicia

### Hot Reload
- **Backend**: Requiere reinicio manual
- **Frontend**: Recarga automática al guardar cambios
