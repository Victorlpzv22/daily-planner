const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const { ipcMain } = require('electron');
const net = require('net');
const fs = require('fs');
const os = require('os');

// Importar autoUpdater de forma segura (puede fallar en algunos entornos)
let autoUpdater = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch (err) {
  console.warn('electron-updater no disponible:', err.message);
}

let mainWindow;
let flaskProcess;

// Prevenir múltiples instancias de la aplicación (Issue #17)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Si otra instancia ya está ejecutándose, cerrar esta
  console.log('⚠️  Ya existe una instancia de Daily Planner en ejecución. Cerrando...');
  app.quit();
} else {
  // Esta es la instancia principal, manejar cuando otra intente abrirse
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('🔄 Se intentó abrir una segunda instancia. Enfocando la ventana existente.');
    // Si el usuario intenta abrir otra instancia, enfocar la ventana existente
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

// Configurar logging
const logFile = path.join(app.getPath('userData'), 'main.log');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    // Fallback si falla el log
    console.error('Error writing to log file:', err);
  }
}

// Sobrescribir console.log y console.error para que también escriban en el archivo
const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
  originalLog(...args);
  logToFile(`INFO: ${args.join(' ')}`);
};

console.error = function (...args) {
  originalError(...args);
  logToFile(`ERROR: ${args.join(' ')}`);
};

// Log inicial
logToFile('----------------------------------------');
logToFile(`App starting. Platform: ${process.platform}, Arch: ${process.arch}`);
logToFile(`User Data Path: ${app.getPath('userData')}`);
logToFile(`Resources Path: ${process.resourcesPath}`);

// Configurar autoUpdater (solo si está disponible)
if (autoUpdater) {
  autoUpdater.logger = {
    info(message) { logToFile(`[AutoUpdater] ${message}`); },
    warn(message) { logToFile(`[AutoUpdater WARN] ${message}`); },
    error(message) { logToFile(`[AutoUpdater ERROR] ${message}`); }
  };
  autoUpdater.autoDownload = false; // Preguntar al usuario antes de descargar
} else {
  logToFile('[AutoUpdater] No disponible - actualizaciones automáticas deshabilitadas');
}

// Verificar si el puerto está disponible
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      console.log(`Port ${port} check error: ${err.message}`);
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

// Esperar a que Flask esté listo
function waitForFlask(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      attempts++;
      console.log(`🔍 Intentando conectar a Flask (${attempts}/${maxAttempts})...`);

      const client = net.connect({ port: 5000, host: '127.0.0.1' }, () => {
        client.end();
        console.log('✅ Flask está listo!');
        resolve();
      });

      client.on('error', () => {
        if (attempts >= maxAttempts) {
          console.error('❌ No se pudo conectar a Flask después de múltiples intentos');
          reject(new Error('Flask no responde'));
        } else {
          setTimeout(check, 1000);
        }
      });
    };

    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'Daily Planner',
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  console.log(`Loading URL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function startFlaskServer() {
  console.log('🚀 Iniciando servidor Flask...');

  // Verificar si el puerto ya está en uso
  const portAvailable = await checkPort(5000);
  if (!portAvailable) {
    console.log('⚠️  Puerto 5000 ya está en uso, usando servidor existente');
    return;
  }

  let serverExecutable;

  if (isDev) {
    // En desarrollo, usar Python como antes
    const serverDir = path.join(__dirname, '../../server');
    let pythonPath = path.join(serverDir, 'venv', 'bin', 'python');

    if (!fs.existsSync(pythonPath)) {
      console.log('⚠️  python no encontrado, intentando con python3...');
      pythonPath = path.join(serverDir, 'venv', 'bin', 'python3');
    }

    const scriptPath = path.join(serverDir, 'start_server.py');

    console.log('📂 Directorio servidor:', serverDir);
    console.log('🐍 Python path:', pythonPath);
    console.log('📄 Script path:', scriptPath);

    if (!fs.existsSync(pythonPath)) {
      console.error('❌ Python no encontrado en:', pythonPath);
      return;
    }

    if (!fs.existsSync(scriptPath)) {
      console.error('❌ Script no encontrado:', scriptPath);
      return;
    }

    console.log('✅ Iniciando Flask con Python (modo desarrollo)');

    flaskProcess = spawn(pythonPath, [scriptPath], {
      cwd: serverDir,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHONPATH: path.join(serverDir, 'src')
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } else {
    // En producción, usar el ejecutable empaquetado
    const serverExecutableName = process.platform === 'win32'
      ? 'daily-planner-server.exe'
      : 'daily-planner-server';

    serverExecutable = path.join(
      process.resourcesPath,
      'server',
      'dist',
      serverExecutableName
    );

    console.log('📂 Buscando ejecutable del servidor...');
    console.log(`📄 Ruta esperada: ${serverExecutable}`);

    if (!fs.existsSync(serverExecutable)) {
      console.error(`❌ Ejecutable del servidor no encontrado: ${serverExecutable}`);
      console.error(`📂 Contenido de resources: ${process.resourcesPath}`);
      try {
        const resourcesContent = fs.readdirSync(process.resourcesPath);
        console.log(`   Archivos/directorios: ${JSON.stringify(resourcesContent)}`);

        // Check server/dist content if server dir exists
        const serverDir = path.join(process.resourcesPath, 'server');
        if (fs.existsSync(serverDir)) {
          const serverContent = fs.readdirSync(serverDir);
          console.log(`   Contenido de server: ${JSON.stringify(serverContent)}`);
          const distDir = path.join(serverDir, 'dist');
          if (fs.existsSync(distDir)) {
            const distContent = fs.readdirSync(distDir);
            console.log(`   Contenido de server/dist: ${JSON.stringify(distContent)}`);
          }
        }
      } catch (err) {
        console.error(`   No se pudo leer el directorio: ${err.message}`);
      }
      return;
    }

    // Hacer el ejecutable... ejecutable (en Linux/Mac)
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(serverExecutable, 0o755);
      } catch (err) {
        console.warn(`⚠️  No se pudo cambiar permisos del ejecutable: ${err.message}`);
      }
    }

    console.log('✅ Iniciando servidor desde ejecutable (modo producción)');

    try {
      flaskProcess = spawn(serverExecutable, [], {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      console.log(`Spawned process with PID: ${flaskProcess.pid}`);
    } catch (spawnErr) {
      console.error(`❌ Error spawning process: ${spawnErr.message}`);
      return;
    }
  }

  flaskProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Flask] ${output}`);
  });

  flaskProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    console.error(`[Flask Error] ${output}`);
  });

  flaskProcess.on('error', (err) => {
    console.error('❌ Error al iniciar Flask:', err);
  });

  flaskProcess.on('close', (code) => {
    console.log(`🛑 Flask cerrado con código ${code}`);
    flaskProcess = null;
  });

  // Esperar a que Flask esté listo antes de continuar
  try {
    await waitForFlask();
  } catch (err) {
    console.error('❌ Error esperando a Flask:', err);
  }
}

// Solo registrar eventos si tenemos el lock de instancia única
if (gotTheLock) {
  app.on('ready', async () => {
    console.log('🎬 Electron iniciado en modo:', isDev ? 'desarrollo' : 'producción');

    try {
      await startFlaskServer();
    } catch (err) {
      console.error('FATAL: Error starting server:', err);
    }
    createWindow();

    // Auto-update logic
    if (!isDev && autoUpdater) {
      autoUpdater.checkForUpdates().catch(err => {
        console.log('Auto-update check failed (this is normal if no releases exist):', err.message);
      });
  }

  // IPC Handlers for updates
  ipcMain.on('check-for-updates', () => {
    if (!isDev && autoUpdater) {
      autoUpdater.checkForUpdates().catch(err => {
        console.log('Manual update check failed:', err.message);
      });
    }
  });

  ipcMain.on('download-update', () => {
    if (autoUpdater) autoUpdater.downloadUpdate();
  });

  ipcMain.on('install-update', () => {
    if (autoUpdater) autoUpdater.quitAndInstall();
  });

  // AutoUpdater events (solo si está disponible)
  if (autoUpdater) {
    autoUpdater.on('checking-for-update', () => {
      logToFile('Checking for update...');
      if (mainWindow) mainWindow.webContents.send('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
      logToFile('Update available: ' + info.version);
      if (mainWindow) mainWindow.webContents.send('update-available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      logToFile('Update not available.');
      if (mainWindow) mainWindow.webContents.send('update-not-available', info);
    });

    autoUpdater.on('error', (err) => {
      logToFile('Error in auto-updater: ' + err);
      if (mainWindow) mainWindow.webContents.send('update-error', err.toString());
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      logToFile(log_message);
      if (mainWindow) mainWindow.webContents.send('update-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      logToFile('Update downloaded');
      if (mainWindow) mainWindow.webContents.send('update-downloaded', info);
    });
  }
});

app.on('window-all-closed', () => {
  if (flaskProcess) {
    console.log('🛑 Cerrando Flask...');
    flaskProcess.kill('SIGTERM');

    // Forzar cierre después de 2 segundos si no responde
    setTimeout(() => {
      if (flaskProcess) {
        console.log('⚠️  Forzando cierre de Flask...');
        flaskProcess.kill('SIGKILL');
      }
    }, 2000);
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  if (flaskProcess) {
    flaskProcess.kill('SIGTERM');
  }
});

} // Fin del bloque if (gotTheLock)

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});