const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const net = require('net');

let mainWindow;
let flaskProcess;

// Verificar si el puerto está disponible
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
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

  const fs = require('fs');
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
    console.log('📄 Ruta esperada:', serverExecutable);

    if (!fs.existsSync(serverExecutable)) {
      console.error('❌ Ejecutable del servidor no encontrado:', serverExecutable);
      console.error('📂 Contenido de resources:', process.resourcesPath);
      try {
        const resourcesContent = fs.readdirSync(process.resourcesPath);
        console.log('   Archivos/directorios:', resourcesContent);
      } catch (err) {
        console.error('   No se pudo leer el directorio:', err.message);
      }
      return;
    }

    // Hacer el ejecutable... ejecutable (en Linux/Mac)
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(serverExecutable, 0o755);
      } catch (err) {
        console.warn('⚠️  No se pudo cambiar permisos del ejecutable:', err.message);
      }
    }

    console.log('✅ Iniciando servidor desde ejecutable (modo producción)');

    flaskProcess = spawn(serverExecutable, [], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
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

app.on('ready', async () => {
  console.log('🎬 Electron iniciado en modo:', isDev ? 'desarrollo' : 'producción');

  await startFlaskServer();
  createWindow();
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

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});