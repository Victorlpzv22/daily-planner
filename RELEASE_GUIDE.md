# Guía de Lanzamiento de Versiones (Release Guide)

Esta guía explica cómo generar una nueva versión de la aplicación Daily Planner manteniendo el historial de cambios.

## 📋 Versionado Semántico

El proyecto sigue [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.x.x): Cambios incompatibles con versiones anteriores
- **MINOR** (x.1.x): Nueva funcionalidad compatible con versiones anteriores
- **PATCH** (x.x.1): Correcciones de bugs compatibles

## 1. Actualizar Versión

El "source of truth" de la versión es el archivo `client/package.json`.

1. Abre `client/package.json`
2. Busca la línea `"version": "1.0.0"`
3. Cámbiala a la nueva versión, ej: `"version": "1.0.1"` o `"version": "1.1.0"`

```json
{
  "name": "daily-planner",
  "version": "1.0.1",
  ...
}
```

**Nota:** Electron Builder utilizará automáticamente esta versión para nombrar los archivos de distribución.

## 2. Ejecutar Tests

Antes de generar una release, asegúrate de que todos los tests pasen:

```bash
cd server && python -m pytest

# Frontend
cd client && npm test
```

## 3. Control de Versiones (Git)

Es recomendable etiquetar la versión en Git para poder volver al código exacto de esa versión en el futuro.

```bash
git add client/package.json
git commit -m "chore: bump version to 1.0.1"
git tag v1.0.1
git push origin main --tags
```

### Documentar Cambios (Recomendado)

Es una buena práctica mantener un archivo `CHANGELOG.md` con los cambios de cada versión:

```markdown
# Changelog

## [1.0.1] - 2025-11-23

### Añadido
- Nueva funcionalidad X
- Soporte para Y

### Corregido
- Bug en componente Z
- Error al guardar tareas

### Cambiado
- Mejorado rendimiento del calendario
```

## 4. Generar el Build

Ejecuta el script de construcción automática:

**En Linux/macOS:**
```bash
./build-all.sh
```

**En Windows:**
```cmd
build-all.bat
```

Este script:
1. Compila el servidor Flask con PyInstaller
2. Construye la aplicación React
3. Empaqueta todo con Electron Builder

## 5. Archivos Generados

Electron Builder incluirá automáticamente el número de versión en el nombre del archivo.

En la carpeta `client/dist/` tendrás:

**Linux:**
- `Daily Planner-1.0.1.AppImage` - Ejecutable portable para Linux (no requiere instalación)
- `latest-linux.yml` - Metadata para auto-actualización

**Windows:**
- `Daily Planner-1.0.1-Setup.exe` - Instalador NSIS con asistente de instalación
- `Daily Planner-1.0.1.exe` - Versión portable (ejecutable único)
- `latest.yml` - Metadata para auto-actualización

**Nota:** Los archivos `.yml` contienen información sobre la versión y checksums para el sistema de auto-actualización.

## 6. Limpieza (Opcional)

Si quieres mantener las versiones anteriores, simplemente **no borres** la carpeta `dist`.

Si el script de build falla o quieres limpiar para asegurar un build fresco:

```bash
# Cuidado: Esto borrará los ejecutables anteriores
rm -rf client/dist/*
rm -rf server/dist/*
```

## 7. Distribución

### AppImage (Linux)
El AppImage es portable y no requiere instalación:
- **Ventajas**: 
  - Sin dependencias del sistema
  - Funciona en cualquier distribución Linux moderna
  - No requiere permisos de administrador
  - Ejecutable único y autocontenido
- **Uso**: 
  ```bash
  chmod +x "Daily Planner-1.0.1.AppImage"
  ./Daily\ Planner-1.0.1.AppImage
  ```

### Windows
- **Instalador NSIS**: Instalación tradicional con asistente, acceso directo en menú inicio y escritorio
- **Portable**: Ejecutable único sin instalación, ideal para USB o ejecución sin permisos de administrador

## Notas Importantes

### Auto-Update
Electron Builder genera archivos `.yml` (`latest-linux.yml`, `latest.yml`) en la carpeta `dist`. Estos archivos son usados por el sistema de auto-actualización para detectar cuál es la última versión disponible.

### Base de Datos
La aplicación empaquetada almacena la base de datos en:
- **Linux**: `~/.local/share/daily-planner/`
- **Windows**: `%APPDATA%/daily-planner/`

Los datos persisten entre actualizaciones.

### Servidor Flask Integrado
El servidor Flask está completamente empaquetado dentro de la aplicación. No se requiere instalación de Python en el sistema del usuario.
