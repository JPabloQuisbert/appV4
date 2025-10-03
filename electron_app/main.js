const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let flaskProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true
    }
  });

  win.loadURL('http://127.0.0.1:5000');
}

function startFlask() {
  // Ruta absoluta al run.py de Flask
//   const flaskScript = path.join(__dirname, '../run.py');

//   // Ejecuta Python con run.py
//   flaskProcess = spawn('python', [flaskScript]);

    const exePath = path.join(__dirname, '../dist/run/run.exe');
    flaskProcess = spawn(exePath);

  flaskProcess.stdout.on('data', (data) => {
    console.log(`Flask stdout: ${data}`);
  });

  flaskProcess.stderr.on('data', (data) => {
    console.error(`Flask stderr: ${data}`);
  });

  flaskProcess.on('close', (code) => {
    console.log(`Flask exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  startFlask();

  // Esperamos 2 seg para que Flask arranque antes de abrir ventana
  setTimeout(createWindow, 2000);
});

// Cuando cierres la app de Electron, matamos Flask
app.on('will-quit', () => {
  if (flaskProcess) {
    flaskProcess.kill();
  }
});
