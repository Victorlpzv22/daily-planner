# 🎨 Daily Planner - Frontend (React + Material-UI)

Interfaz de usuario moderna y responsiva para la aplicación Daily Planner con Material Design 3 y soporte para aplicación de escritorio.

---

## 🛠️ Tecnologías

- **React 18.2.0** - Biblioteca UI
- **Material-UI 5.14.17** - Sistema de diseño Material Design 3
- **@emotion/react 11.11.1** - CSS-in-JS
- **@emotion/styled 11.11.0** - Styled components
- **Material Icons 5.14.16** - Iconos Material Design
- **React Scripts 5.0.1** - Herramientas de desarrollo
- **Axios 1.6.2** - Cliente HTTP
- **date-fns 2.30.0** - Manejo de fechas
- **Electron 27.1.0** - Framework para aplicaciones de escritorio
- **Electron Builder 24.9.1** - Empaquetado de aplicaciones

---

## 📁 Estructura

```
client/
├── public/
│   ├── electron.js          # Configuración Electron
│   ├── icon.png             # Icono para Linux
│   ├── icon.ico             # Icono para Windows
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header.jsx       # Cabecera de la app
│   │   ├── TaskList.jsx     # Lista de tareas
│   │   ├── TaskItem.jsx     # Tarjeta individual de tarea
│   │   ├── TaskForm.jsx     # Formulario crear/editar (con soporte periódicas)
│   │   ├── TaskFilter.jsx   # Filtros de tareas
│   │   ├── ViewSelector.jsx # Selector de vistas
│   │   ├── MonthView.jsx    # Vista calendario mensual
│   │   └── WeekView.jsx     # Vista semanal
│   ├── services/
│   │   └── api.js           # Servicios API
│   ├── App.js               # Componente principal
│   └── index.js             # Punto de entrada
├── dist/                    # Aplicaciones de escritorio empaquetadas
├── .env                     # Variables de entorno
├── package.json             # Dependencias y scripts
└── README.md                # Este archivo
```

---

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd client
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en el directorio `client/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Iniciar aplicación

```bash
npm start
```

La aplicación se abrirá automáticamente en **http://localhost:3000**

---

## 📦 Scripts Disponibles

### Desarrollo
```bash
npm start
```
- Inicia el servidor de desarrollo
- Abre http://localhost:3000
- Recarga automática al guardar cambios

### Build para Producción
```bash
npm run build
```
- Crea versión optimizada en carpeta `build/`
- Minifica y optimiza archivos
- Listo para desplegar

### Testing
```bash
npm test
```
- Ejecuta tests en modo interactivo
- Usa Jest y React Testing Library

### Eject (¡No reversible!)
```bash
npm run eject
```
- Expone configuración de webpack
- Solo si necesitas personalización avanzada

### Electron - Desarrollo
```bash
npm run electron-dev
```
- Inicia React y Electron simultáneamente
- Abre la aplicación de escritorio

### Electron - Compilar para Distribución
```bash
# Linux (AppImage y Pacman)
npm run dist:linux

# Windows (NSIS Installer y Portable)
npm run dist:win

# Ambas plataformas
npm run dist:all
```
- Crea aplicaciones de escritorio empaquetadas en `dist/`

---

## 🎨 Componentes

### Header
**Ubicación:** `src/components/Header.jsx`

Muestra el título de la aplicación y la fecha actual.

```jsx
<Header />
```

---

### TaskList
**Ubicación:** `src/components/TaskList.jsx`

Lista de tareas con acciones (completar, editar, eliminar).

```jsx
<TaskList
  tasks={tasks}
  onToggle={handleToggle}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

### TaskItem
**Ubicación:** `src/components/TaskItem.jsx`

Tarjeta individual de tarea con:
- Checkbox para completar
- Título y descripción
- Badge de prioridad
- Botones de editar/eliminar

```jsx
<TaskItem
  task={task}
  onToggle={onToggle}
  onEdit={onEdit}
  onDelete={onDelete}
/>
```

---

### TaskForm
**Ubicación:** `src/components/TaskForm.jsx`

Formulario para crear o editar tareas con soporte para tareas periódicas.

**Props:**
- `task` - Tarea a editar (null para crear nueva)
- `onSubmit` - Función al enviar formulario
- `onCancel` - Función al cancelar

**Características:**
- Campos para título, descripción, fechas, hora
- Selector de prioridad y color
- **Configuración de recurrencia**:
  - Checkbox para activar tareas periódicas
  - Selector de frecuencia (diaria, semanal, mensual, anual)
  - Intervalo personalizable
  - Selección de días de la semana (para frecuencia semanal)
  - Tipo de finalización (por fecha o por número de ocurrencias)

```jsx
<TaskForm
  task={editingTask}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

---

### TaskFilter
**Ubicación:** `src/components/TaskFilter.jsx`

Botones de filtro (Todas, Pendientes, Completadas).

```jsx
<TaskFilter
  currentFilter={filter}
  onFilterChange={setFilter}
  taskCounts={{
    all: 10,
    pending: 5,
    completed: 5
  }}
/>
```

---

### ViewSelector
**Ubicación:** `src/components/ViewSelector.jsx`

Selector de vistas (Lista, Calendario Mes, Calendario Semanas).

```jsx
<ViewSelector
  currentView={currentView}
  onViewChange={setCurrentView}
/>
```

---

### MonthView
**Ubicación:** `src/components/MonthView.jsx`

Calendario mensual que muestra:
- Tareas diarias en su día específico
- Tareas semanales en todos los días de la semana
- Navegación entre meses
- Click en día para crear tarea

```jsx
<MonthView
  tasks={tasks}
  onTaskClick={handleEditTask}
  onDayClick={handleDayClick}
/>
```

---

### WeekView
**Ubicación:** `src/components/WeekView.jsx`

Vista de tareas agrupadas por semanas del mes.

```jsx
<WeekView
  tasks={tasks}
  onTaskClick={handleEditTask}
/>
```

---

## 🌐 Servicios API

**Ubicación:** `src/services/api.js`

### Configuración

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Métodos Disponibles

```javascript
import { taskService } from './services/api';

// Obtener todas las tareas
const response = await taskService.getAllTasks();

// Obtener tarea por ID
const response = await taskService.getTaskById(id);

// Crear tarea
const response = await taskService.createTask(taskData);

// Actualizar tarea
const response = await taskService.updateTask(id, taskData);

// Eliminar tarea
await taskService.deleteTask(id);

// Cambiar estado
const response = await taskService.toggleTask(id);

// Obtener pendientes
const response = await taskService.getPendingTasks();

// Obtener por fecha
const response = await taskService.getTasksByDate(date);
```

---

## 🎨 Estilos

### Material-UI Theme

La aplicación utiliza Material Design 3 con un tema personalizado:

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

### Componentes Material-UI Utilizados
- **Button**: Botones de acción
- **TextField**: Campos de entrada
- **Select**: Selectores desplegables
- **Checkbox**: Casillas de verificación
- **Dialog**: Diálogos modales
- **Card**: Tarjetas de tareas
- **IconButton**: Botones con iconos
- **DatePicker**: Selector de fechas
- **Chip**: Etiquetas de prioridad y tipo

### Prioridades y Colores

Las tareas pueden tener:
- **Prioridades**: Alta, Media, Baja (con colores predefinidos)
- **Colores personalizados**: Selector de color para cada tarea

---

## 🔧 Configuración

### Variables de Entorno

**Archivo:** `.env`

```env
# URL del backend
REACT_APP_API_URL=http://localhost:5000/api

# Otras variables (si las añades)
REACT_APP_DEBUG=true
```

**Importante:**
- Las variables DEBEN empezar con `REACT_APP_`
- Reinicia el servidor después de modificar `.env`

---

## 🐛 Solución de Problemas

### "react-scripts: command not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Cambios en .env no se reflejan

```bash
# Detener servidor (Ctrl+C)
npm start
```

### Error de CORS

Verifica que el backend permite el origen:
```javascript
// En server/src/app.py
CORS(app)
```

### Componente no se actualiza

```bash
# Limpiar caché
rm -rf node_modules/.cache
npm start
```

---

## 📱 Responsive Design

La aplicación es totalmente responsive:

- **Desktop:** Vista completa con todas las características
- **Tablet:** Ajuste de grid y tamaños
- **Mobile:** Vista adaptada, botones más grandes

Breakpoints:
- `1024px` - Tablet landscape
- `768px` - Tablet portrait
- `480px` - Mobile

---

## ♿ Accesibilidad

- Etiquetas semánticas HTML5
- Atributos `aria-*` en elementos interactivos
- Contraste de colores WCAG AA
- Navegación por teclado

---

## 🚀 Despliegue

### Build de Producción

```bash
npm run build
```

Esto crea una carpeta `build/` con archivos optimizados.

### Servir archivos estáticos

**Con serve:**
```bash
npm install -g serve
serve -s build -p 3000
```

**Con servidor web:**
- Apache: Copia `build/*` a `htdocs/`
- Nginx: Configura `root` a la carpeta `build/`

### Netlify / Vercel

1. Conecta tu repositorio
2. Build command: `npm run build`
3. Publish directory: `build`
4. Variables de entorno: `REACT_APP_API_URL`

---

## 🧪 Testing

### Ejecutar tests

```bash
npm test
```

### Estructura de Tests

El proyecto utiliza **Jest** y **React Testing Library**.

#### 1. TaskForm (`TaskForm.test.js`)
- Renderizado de campos vacíos y con datos
- Validación de campos obligatorios (título)
- Simulación de envío de formulario
- Toggle de opciones de recurrencia
- Mock de `LocalizationProvider` para date pickers

#### 2. TaskItem (`TaskItem.test.js`)
- Renderizado de detalles de tarea
- Interacción con checkbox (completar)
- Botones de editar y eliminar
- Estilos visuales para tareas completadas

```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Daily Planner/i);
  expect(headerElement).toBeInTheDocument();
});
```

---

## 📈 Optimizaciones

### Code Splitting

React lazy loading (preparado para implementar):

```javascript
const MonthView = React.lazy(() => import('./components/MonthView'));
```

### Memoización

Para evitar re-renders innecesarios:

```javascript
const MemoizedTaskItem = React.memo(TaskItem);
```


---

## 📝 Notas

- Hot reload activado en desarrollo
- Source maps habilitados para debugging
- Material-UI proporciona componentes accesibles por defecto
- Soporte para tareas periódicas con interfaz intuitiva
- Aplicación de escritorio disponible con Electron

---

## 🖥️ Aplicación de Escritorio (Electron)

### Características
- Aplicación nativa para Linux y Windows
- Servidor Flask integrado (no requiere instalación de Python)
- Icono personalizado para cada plataforma
- Instalador configurable (Windows NSIS)
- Formatos portables (Windows Portable, Linux AppImage)
- Paquete Pacman para Arch Linux

### Desarrollo
```bash
npm run electron-dev
```

Inicia el servidor de desarrollo React y abre la aplicación Electron.

### Compilación

**Linux:**
```bash
npm run dist:linux
```
Genera:
- `Daily-Planner-x.x.x.AppImage`
- `Daily-Planner-x.x.x.pacman`

**Windows:**
```bash
npm run dist:win
```
Genera:
- `Daily-Planner-x.x.x-Setup.exe` (Instalador NSIS)
- `Daily-Planner-x.x.x.exe` (Portable)

**Ambas:**
```bash
npm run dist:all
```

### Configuración Electron

La configuración se encuentra en `package.json` bajo la sección `build`:
- **appId**: Identificador de la aplicación
- **productName**: Nombre del producto
- **files**: Archivos a incluir
- **extraResources**: Recursos adicionales (servidor Flask)
- **linux/win**: Configuración específica por plataforma
