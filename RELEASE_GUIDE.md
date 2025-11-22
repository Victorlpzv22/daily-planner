# Guía de Lanzamiento de Versiones (Release Guide)

Esta guía explica cómo generar una nueva versión de la aplicación (ej. 1.0.0 -> 1.0.1) manteniendo el historial.

## 1. Actualizar Versión

El "source of truth" de la versión es el archivo `client/package.json`.

1. Abre `client/package.json`
2. Busca la línea `"version": "1.0.0"`
3. Cámbiala a la nueva versión, ej: `"version": "1.0.1"`

```json
{
  "name": "daily-planner",
  "version": "1.0.1",
  ...
}
```

## 2. Control de Versiones (Git)

Es recomendable etiquetar la versión en Git para poder volver al código exacto de esa versión en el futuro.

```bash
git add client/package.json
git commit -m "chore: bump version to 1.0.1"
git tag v1.0.1
```

## 3. Generar el Build

Ejecuta el script de construcción automática:

**En Linux/macOS:**
```bash
./build-all.sh
```

**En Windows:**
```cmd
build-all.bat
```

## 4. Archivos Generados

Electron Builder incluirá automáticamente el número de versión en el nombre del archivo.

En la carpeta `client/dist/` tendrás:

- `Daily Planner-1.0.0.AppImage` (Versión anterior)
- `Daily Planner-1.0.1.AppImage` (Nueva versión)
- `latest-linux.yml` (Apunta a la versión 1.0.1)

## 5. Limpieza (Opcional)

Si quieres mantener las versiones anteriores, simplemente **no borres** la carpeta `dist`.
Si el script de build falla o quieres limpiar para asegurar un build fresco:

```bash
# Cuidado: Esto borrará los ejecutables anteriores
rm -rf client/dist/*
```

## Notas sobre Auto-Update

Electron Builder genera archivos `.yml` (`latest-linux.yml`, `latest.yml`) en la carpeta `dist`. Estos archivos son usados por el sistema de auto-actualización para detectar cuál es la última versión disponible.
