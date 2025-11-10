# 🎨 Daily Planner - Frontend (React)

Interfaz de usuario moderna y responsiva para la aplicación Daily Planner.

---

## 🛠️ Tecnologías

- **React 19.2.0** - Biblioteca UI
- **React Scripts 5.0.1** - Herramientas de desarrollo
- **Axios 1.13.2** - Cliente HTTP
- **date-fns 4.1.0** - Manejo de fechas
- **React Icons 5.5.0** - Iconos
- **React Router DOM 7.9.5** - Navegación (preparado para futuras rutas)

---

## 📁 Estructura

```
client/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header.jsx       # Cabecera de la app
│   │   ├── TaskList.jsx     # Lista de tareas
│   │   ├── TaskItem.jsx     # Tarjeta individual de tarea
│   │   ├── TaskForm.jsx     # Formulario crear/editar
│   │   ├── TaskFilter.jsx   # Filtros de tareas
│   │   ├── ViewSelector.jsx # Selector de vistas
│   │   ├── MonthView.jsx    # Vista calendario mensual
│   │   └── WeekView.jsx     # Vista semanal
│   ├── services/
│   │   └── api.js           # Servicios API
│   ├── styles/              # Archivos CSS
│   │   ├── App.css
│   │   ├── Header.css
│   │   ├── TaskList.css
│   │   ├── TaskItem.css
│   │   ├── TaskForm.css
│   │   ├── TaskFilter.css
│   │   ├── ViewSelector.css
│   │   ├── MonthView.css
│   │   └── WeekView.css
│   ├── App.js               # Componente principal
│   ├── index.js             # Punto de entrada
│   └── index.css            # Estilos globales
├── .env                     # Variables de entorno
├── package.json             # Dependencias
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

Formulario para crear o editar tareas.

**Props:**
- `task` - Tarea a editar (null para crear nueva)
- `onSubmit` - Función al enviar formulario
- `onCancel` - Función al cancelar

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

### Variables CSS Globales

Los colores principales se definen en `index.css`:

```css
:root {
  --color-primary: #4f46e5;
  --color-danger: #ef4444;
  --color-success: #10b981;
  --color-warning: #f59e0b;
}
```

### Prioridades

```css
.priority-alta { /* Rojo */ }
.priority-media { /* Amarillo */ }
.priority-baja { /* Verde */ }
```

### Tipos de Tarea

```css
.task-pill.weekly-task {
  border-left-style: dashed;
  opacity: 0.85;
}
```

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

### Estructura de tests

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
- ESLint configurado para React
- Prettier recomendado para formato de código