# 📅 Daily Planner - Aplicación de Gestión de Tareas

Aplicación web y de escritorio full-stack para gestionar tareas con calendario interactivo y soporte para tareas periódicas.

## 🚀 Características

### ✨ Gestión de Tareas
- ✅ Crear, editar y eliminar tareas
- ✅ Marcar tareas como completadas
- ✅ Establecer prioridades (Alta, Media, Baja)
- ✅ Tipos de tareas: Diarias y Semanales
- ✅ Añadir fecha de inicio, fecha de fin, hora y descripción
- ✅ Filtrar por estado (Todas, Pendientes, Completadas)
- ✅ **Tareas Periódicas**: Crear tareas recurrentes con reglas personalizadas
  - Frecuencia: Diaria, Semanal, Mensual, Anual
  - Intervalo personalizable (cada N días/semanas/meses/años)
  - Selección de días de la semana específicos
  - Finalización por fecha límite o número de ocurrencias
- ✅ Colores personalizables para cada tarea
- ✅ Agrupación de tareas periódicas con `group_id`

### 📊 Visualizaciones
- **Vista Lista**: Lista tradicional de tareas con filtros
- **Vista Calendario Mensual (Días)**: Calendario que muestra tareas por día
  - Tareas diarias aparecen en su día específico
  - Tareas semanales aparecen en todos los días de esa semana
  - Tareas periódicas se muestran en todas sus ocurrencias
- **Vista Calendario Mensual (Semanas)**: Tareas agrupadas por semanas

### 🎨 Interfaz
- Diseño moderno con **Material Design 3** (Material-UI)
- Código de colores por prioridad y colores personalizados
- Navegación intuitiva entre vistas
- Indicadores visuales para tareas semanales y periódicas
- Calendario interactivo
- Interfaz responsiva y accesible
- **Aplicación de escritorio** con Electron (Linux y Windows)

---

## 🛠️ Tecnologías

### Backend
- **Python 3.10+**
- **Flask 3.0.0** - Framework web
- **SQLAlchemy 2.0.44** - ORM para base de datos
- **Flask-CORS 4.0.0** - Manejo de CORS
- **Flask-SQLAlchemy 3.1.1** - Integración Flask-SQLAlchemy
- **python-dateutil 2.8.2** - Manejo avanzado de fechas y recurrencias
- **PyInstaller 6.16+** - Empaquetado del servidor como ejecutable
- **SQLite** - Base de datos

### Frontend
- **React 18.2.0** - Biblioteca UI
- **Material-UI 5.14.17** - Sistema de diseño Material Design 3
- **Emotion** - CSS-in-JS para estilos
- **Axios 1.6.2** - Cliente HTTP
- **date-fns 2.30.0** - Manejo de fechas
- **React Scripts 5.0.1** - Herramientas de desarrollo

### Desktop
- **Electron 27.1.0** - Framework para aplicaciones de escritorio
- **Electron Builder 24.9.1** - Empaquetado de aplicaciones
- Soporte para **Linux** (AppImage, Pacman) y **Windows** (NSIS, Portable)

---

## 📁 Estructura del Proyecto

```
daily-planner/
├── server/                      # Backend (Flask)
│   ├── src/
│   │   ├── app.py              # Aplicación principal Flask
│   │   ├── config/             # Configuración
│   │   ├── database/           # Configuración de base de datos
│   │   │   └── db.py
│   │   ├── models/             # Modelos SQLAlchemy
│   │   │   └── task.py         # Modelo de tareas
│   │   ├── controllers/        # Lógica de negocio
│   │   │   └── task_controller.py
│   │   ├── routes/             # Rutas API
│   │   │   └── task_routes.py
│   │   └── utils/              # Utilidades
│   │       └── recurrence.py   # Manejo de tareas periódicas
│   ├── tests/                   # Tests unitarios
│   │   └── test_periodic_tasks.py
│   ├── dist/                    # Ejecutable del servidor (PyInstaller)
│   │   └── daily-planner-server
│   ├── build_server.py          # Script de build con PyInstaller
│   ├── server.spec              # Configuración PyInstaller
│   ├── start_server.py          # Punto de entrada del servidor
│   ├── venv/                    # Entorno virtual Python
│   ├── requirements.txt         # Dependencias Python
│   └── README.md                # Documentación del servidor
│
├── client/                      # Frontend (React + Material-UI)
│   ├── public/
│   │   ├── electron.js         # Configuración Electron
│   │   ├── icon.png            # Icono Linux
│   │   └── icon.ico            # Icono Windows
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── Header.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── MonthView.jsx
│   │   │   └── WeekView.jsx
│   │   ├── services/           # Servicios API
│   │   │   └── api.js
│   │   ├── theme/              # Tema Material Design 3
│   │   │   └── theme.js
│   │   └── App.js              # Componente principal
│   ├── dist/                    # Aplicaciones de escritorio empaquetadas
│   ├── package.json             # Dependencias y scripts
│   └── README.md                # Documentación del cliente
│
├── build-all.sh                 # Script de build automatizado
└── README.md                    # Este archivo
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

### Crear una Tarea Simple
1. Click en **"+ Nueva Tarea"**
2. Completa el formulario:
   - **Título** (obligatorio)
   - **Descripción** (opcional)
   - **Fecha de inicio** (obligatoria)
   - **Fecha de fin** (obligatoria)
   - **Hora** (opcional)
   - **Prioridad**: Alta, Media o Baja
   - **Color**: Selecciona un color personalizado
3. Click en **"Crear Tarea"**

### Crear una Tarea Periódica
1. Click en **"+ Nueva Tarea"**
2. Completa la información básica de la tarea
3. Activa **"Tarea Periódica"**
4. Configura la recurrencia:
   - **Frecuencia**: Diaria, Semanal, Mensual o Anual
   - **Intervalo**: Cada cuántos días/semanas/meses/años
   - **Días de la semana** (solo para frecuencia semanal)
   - **Tipo de finalización**:
     - Por fecha: Especifica una fecha límite
     - Por número de ocurrencias: Define cuántas veces se repetirá
5. Click en **"Crear Tarea"**

Las tareas periódicas se crean automáticamente como múltiples instancias vinculadas por un `group_id`.

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
| POST | `/api/tasks/` | Crear nueva tarea (simple o periódica) |
| PUT | `/api/tasks/<id>` | Actualizar tarea |
| DELETE | `/api/tasks/<id>` | Eliminar tarea |
| PATCH | `/api/tasks/<id>/toggle` | Cambiar estado completada |
| GET | `/api/tasks/pending` | Obtener tareas pendientes |
| GET | `/api/tasks/date/<fecha>` | Obtener tareas por fecha |
| DELETE | `/api/tasks/group/<group_id>` | Eliminar todas las tareas de un grupo periódico |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verificar estado del servidor y conexión a BD |

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
- SQLite almacenada en `server/instance/daily_planner.db`
- Se crea automáticamente al iniciar el servidor
- Para resetear: elimina el archivo `.db` y reinicia

### Hot Reload
- **Backend**: Recarga automática en modo debug
- **Frontend**: Recarga automática al guardar cambios

### Testing
- Tests unitarios disponibles en `server/tests/`
- Ejecutar tests: `python -m pytest server/tests/`

---

## 🖥️ Aplicación de Escritorio (Electron)

La aplicación Daily Planner puede ejecutarse como una **aplicación de escritorio autocontenida** que no requiere Python instalado en el sistema del usuario.

### Arquitectura

- **Frontend**: React empaquetado con Electron
- **Backend**: Servidor Flask empaquetado con PyInstaller como ejecutable standalone
- **Base de datos**: SQLite en ubicación estándar del sistema operativo:
  - Linux: `~/.local/share/daily-planner/`
  - Windows: `%APPDATA%/daily-planner/`
  - macOS: `~/Library/Application Support/daily-planner/`

### Desarrollo

**Opción 1: Modo desarrollo tradicional (Python + React)**
```bash
# Terminal 1: Servidor
cd server
source venv/bin/activate
python src/app.py

# Terminal 2: Cliente
cd client
npm start
```

**Opción 2: Electron en modo desarrollo**
```bash
cd client
npm run electron-dev
```

Esto iniciará tanto el servidor React como la aplicación Electron. El servidor Flask se ejecuta usando Python del entorno virtual.

### Build de Producción

#### Build Automático (Recomendado)

```bash
# Desde la raíz del proyecto
./build-all.sh
```

Este script automatiza todo el proceso:
1. ✅ Verifica dependencias (Python, npm)
2. ✅ Instala dependencias del servidor
3. ✅ Construye ejecutable del servidor con PyInstaller
4. ✅ Instala dependencias del cliente
5. ✅ Construye aplicación React
6. ✅ Empaqueta con Electron Builder

#### Build Manual

**Paso 1: Construir servidor standalone**
```bash
cd server
source venv/bin/activate
pip install -r requirements.txt  # Incluye PyInstaller
python build_server.py
```

Esto genera `server/dist/daily-planner-server` (~30MB), un ejecutable que incluye:
- Intérprete Python
- Flask y todas las dependencias
- Código del servidor

**Paso 2: Construir aplicación Electron**

**Linux (AppImage y Pacman):**
```bash
cd client
npm run build
npm run dist:linux
```

**Windows (NSIS Installer y Portable):**
```bash
cd client
npm run build
npm run dist:win
```

**Todas las plataformas:**
```bash
cd client
npm run build
npm run dist:all
```

Los archivos compilados se guardarán en `client/dist/`:
- **Linux**: `Daily-Planner-[version].AppImage`, `Daily-Planner-[version].pacman`
- **Windows**: `Daily-Planner-[version]-Setup.exe`, `Daily-Planner-[version]-portable.exe`

### Características de la App de Escritorio

✅ **Autocontenida**: No requiere Python instalado  
✅ **Multiplataforma**: Linux, Windows, macOS  
✅ **Persistencia**: Datos en ubicación estándar del SO  
✅ **Instaladores nativos**: NSIS (Windows), AppImage (Linux)  
✅ **Portable**: Versiones portables disponibles  
✅ **Profesional**: Iconos y metadatos configurados  

### Distribución

Los paquetes generados son completamente independientes y pueden distribuirse a usuarios finales sin requerir instalación de dependencias.

**Tamaño aproximado:**
- Linux AppImage: ~80-100MB
- Windows Installer: ~80-100MB
- Windows Portable: ~80-100MB

### Notas Técnicas

- **Primera ejecución**: La aplicación crea automáticamente el directorio de datos y la base de datos
- **Actualizaciones**: Los datos del usuario se preservan entre versiones
- **Desarrollo vs Producción**: 
  - Desarrollo: Usa Python del venv
  - Producción: Usa ejecutable empaquetado
- **Logs**: En producción, los logs del servidor se muestran en la consola de Electron

---

