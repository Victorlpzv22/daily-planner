@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo 🏗️  Building Daily Planner Desktop App (Windows)
echo ==========================================
echo.

:: Directorios
set "SCRIPT_DIR=%~dp0"
set "SERVER_DIR=%SCRIPT_DIR%server"
set "CLIENT_DIR=%SCRIPT_DIR%client"

:: Paso 1: Verificar dependencias
echo ▶ Checking dependencies...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

echo   ✓ Dependencies found
echo.

:: Paso 2: Instalar dependencias del servidor
echo ▶ Installing server dependencies...
cd "%SERVER_DIR%"

if not exist "venv" (
    echo   Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo   ✓ Server dependencies installed
echo.

:: Paso 3: Construir ejecutable del servidor
echo ▶ Building server executable with PyInstaller...
python build_server.py

if not exist "dist\daily-planner-server.exe" (
    echo ❌ Server executable not created!
    pause
    exit /b 1
)

echo   ✓ Server executable created
echo.

:: Paso 4: Instalar dependencias del cliente
echo ▶ Installing client dependencies...
cd "%CLIENT_DIR%"

if not exist "node_modules" (
    call npm install
) else (
    echo   ✓ Dependencies already installed
)
echo.

:: Paso 5: Construir app React
echo ▶ Building React application...
call npm run build

if not exist "build" (
    echo ❌ React build failed!
    pause
    exit /b 1
)

echo   ✓ React app built
echo.

:: Paso 6: Empaquetar con Electron
echo ▶ Packaging with Electron Builder...
echo.

call npm run dist:win

echo.
echo ==========================================
echo ✨ Build Complete!
echo ==========================================
echo.
echo 📦 Distributable packages created in:
echo    %CLIENT_DIR%\dist\
echo.
pause
