# Solución a Problemas de Instalación

## Problema Encontrado

Al intentar instalar el paquete `.pacman`, se encontró un error de dependencia con `http-parser`, que ya no está disponible en los repositorios de Arch Linux.

## Solución Implementada

### 1. Dependencias Faltantes

Se identificaron y agregaron las siguientes dependencias que faltaban en `package.json`:

- `electron-is-dev` - Movido de devDependencies a dependencies (necesario en runtime)
- `web-vitals` - Requerido por reportWebVitals.js
- `dayjs` - Usado en componentes de fecha
- `@mui/x-date-pickers` - Componente de selección de fechas

### 2. Configuración de Electron Builder

Se simplificó la configuración para usar **solo AppImage** en lugar de pacman, evitando problemas de dependencias del sistema.

**Cambio en `client/package.json`:**
```json
"linux": {
  "target": [
    {
      "target": "AppImage",
      "arch": ["x64"]
    }
  ],
  ...
}
```

## Resultado

✅ **AppImage generado exitosamente**: `Daily Planner-1.0.0.AppImage` (166MB)

### Cómo Usar el AppImage

```bash
cd /home/victor/Proyectos/daily-planner/client/dist/
chmod +x "Daily Planner-1.0.0.AppImage"
./"Daily Planner-1.0.0.AppImage"
```

### Ventajas del AppImage

1. **Sin dependencias del sistema** - No requiere instalación de paquetes
2. **Portable** - Puede ejecutarse desde cualquier ubicación
3. **Sin conflictos** - No interfiere con otros paquetes del sistema
4. **Fácil distribución** - Un solo archivo ejecutable

## Builds Futuros

Para generar el AppImage en el futuro:

```bash
# Desde la raíz del proyecto
./build-all.sh

# O manualmente
cd client
npm run dist:linux
```

El AppImage se generará en `client/dist/`.

## Notas

- El AppImage incluye todo lo necesario: Electron + React + Servidor Flask empaquetado
- La base de datos se crea automáticamente en `~/.local/share/daily-planner/`
- Los datos persisten entre ejecuciones
