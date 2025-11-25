# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [1.1.0] - 2025-11-25

### Añadido
- ✅ **Subtareas**: Soporte completo para subtareas en cada tarea
  - Crear, editar y eliminar subtareas
  - Toggle de completado individual
  - Visualización de progreso en TaskItem y TaskDetailDialog
- ✅ **Instancia única** (Issue #17): La aplicación ahora solo permite una instancia
  - Al abrir una segunda instancia, se enfoca la ventana existente
  - Implementado con `app.requestSingleInstanceLock()`
- ✅ **Selectores de recurrencia mejorados** (Issue #6):
  - Nuevas opciones de repetición mensual: días específicos del mes o día de la semana
  - Soporte para `monthdays`, `monthWeek` y `monthWeekday`
  - Tareas semanales solo permiten frecuencia semanal/mensual/anual (no diaria)
  - Tareas semanales comienzan en lunes automáticamente
  - Mensajes informativos según tipo de tarea y frecuencia
- ✅ **Colores predefinidos personalizables** (Issue #14):
  - Los colores de la paleta ahora se pueden editar
  - Persistencia en localStorage
  - Opción para restaurar colores por defecto
- ✅ **Actualizaciones automáticas**:
  - Integración de `electron-updater` para auto-actualizaciones
  - Componente `UpdateNotification` para mostrar progreso de descarga
  - Configuración de publicación en GitHub Releases
  - Manejo de errores cuando no existen releases (404)
- ✅ **Suite de Tests Ampliada**: 115 tests automatizados
  - Tests de modelos (Task, Subtask, relaciones)
  - Tests de rutas API (CRUD completo)
  - Tests de tareas periódicas (diarias, semanales, mensuales)
  - Tests de validación de datos de entrada
  - Tests de subtareas API
- ✅ **Scripts de build mejorados**:
  - Limpieza automática de artefactos anteriores
  - Verificación de ejecutables generados

### Corregido
- 🐛 **OverflowError en recurrencia**: Límite de 365 tareas máximo por recurrencia
- 🐛 **Bug de recurrencia**: Error IndexError cuando la fecha fin era anterior a la fecha de inicio
  - Ahora devuelve error 400 con mensaje explicativo
- 🐛 **APIs deprecadas de SQLAlchemy**: Reemplazado `Query.get()` por `db.session.get()`
- 🐛 **datetime.utcnow() deprecado**: Reemplazado por `datetime.now(timezone.utc)`
- 🐛 Reducción de warnings de deprecación de 1137 a 77
- 🐛 Validación de fechas para evitar overflow

### Cambiado
- 📝 Tests actualizados para verificar el comportamiento correcto de recurrencia
- 📝 Modelos Task y Subtask usan función helper `utc_now()` para timestamps
- 📝 Documentación actualizada con sección de publicación y auto-actualización

### Técnico
- Backend: Flask 3.0.0, SQLAlchemy 2.0.44 (sin warnings de deprecación)
- Cliente: Electron 27.1.0 con electron-updater para actualizaciones
- Testing: pytest con 115 tests pasando
- Cobertura de tests mejorada para subtareas y validaciones
- Nueva migración `bc47800e64b9` para tabla subtasks

---

## [1.0.0] - 2025-11-23

### Añadido
- ✅ Aplicación web completa con React 18 y Material-UI 5
- ✅ Backend REST API con Flask 3.0 y SQLAlchemy 2.0
- ✅ Gestión completa de tareas (crear, editar, eliminar, completar)
- ✅ Sistema de prioridades (Alta, Media, Baja)
- ✅ Tipos de tareas: Diarias y Semanales
- ✅ **Tareas Periódicas** con configuración avanzada:
  - Frecuencias: Diaria, Semanal, Mensual, Anual
  - Intervalos personalizables
  - Selección de días de la semana
  - Finalización por fecha o número de ocurrencias
- ✅ Colores personalizables para cada tarea
- ✅ Tres vistas de visualización:
  - Vista Lista con filtros
  - Vista Calendario Mensual (Días)
  - Vista Calendario Mensual (Semanas)
- ✅ **Aplicación de Escritorio** con Electron:
  - Soporte para Linux (AppImage)
  - Soporte para Windows (NSIS Installer y Portable)
  - Servidor Flask integrado (no requiere Python instalado)
  - Base de datos SQLite en ubicación estándar del sistema
- ✅ Suite completa de tests:
  - Tests unitarios del backend con Pytest
  - Tests de componentes React con Jest y React Testing Library
- ✅ Scripts de build automatizados (`build-all.sh` y `build-all.bat`)
- ✅ Documentación completa en español
- ✅ Material Design 3 con tema personalizado
- ✅ Interfaz responsiva y accesible

### Tecnologías
- **Frontend**: React 18.2.0, Material-UI 5.14.17, Axios 0.27.2, date-fns 2.30.0
- **Backend**: Flask 3.0.0, SQLAlchemy 2.0.44, python-dateutil 2.8.2
- **Desktop**: Electron 27.1.0, Electron Builder 24.9.1
- **Database**: SQLite
- **Testing**: Pytest (backend), Jest + React Testing Library (frontend)

### Características Destacadas
- 🎨 Diseño moderno con Material Design 3
- 📅 Calendario interactivo con múltiples vistas
- 🔄 Soporte completo para tareas recurrentes
- 🖥️ Aplicación de escritorio multiplataforma
- 🧪 Cobertura de tests completa
- 📦 Build automatizado para distribución
- 🌐 API REST bien documentada

---

## Formato de Versiones Futuras

### [X.Y.Z] - YYYY-MM-DD

#### Añadido
- Nuevas características

#### Cambiado
- Cambios en funcionalidad existente

#### Obsoleto
- Características que serán removidas

#### Eliminado
- Características eliminadas

#### Corregido
- Corrección de bugs

#### Seguridad
- Correcciones de vulnerabilidades
