import { app, ipcMain, BrowserWindow, globalShortcut } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { WindowService } from './WindowService';
import { SettingsService } from './SettingsService';
import { FilesService } from './FileService';
import { EmulatorRepositoryService } from './EmulatorRepositoryService';
import { HashService } from './HashService';
import { GamesService } from './GamesService';
import { ExtraDataService } from './ExtraDataService';
import { EventLogService } from './EventLogService';
import { OpenMSXLaunchService } from './OpenMSXLaunchService';
import { BlueMSXLaunchService } from './BlueMSXLaunchService';
import { EmulatorHardwareService } from './EmulatorHardwareService';
import { ScanService } from './ScanService';
import { OpenMSXControlService } from './OpenMSXControlService';
import { RelatedGamesService } from './RelatedGamesService';
import { EnvironmentService } from './EnvironmentService';
import { BackupsService } from './BackupsService';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: process.platform !== 'win32',
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'assets/icon.png'),
    backgroundColor: '#2e2c29',
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      allowRunningInsecureContent: true,
      contextIsolation: false
    }
  });

  initializeServices();

  return win;
}

function initializeServices() {
  new WindowService(win);

  const settingsService = new SettingsService(win);

  const extraDataService = new ExtraDataService(win);

  const emulatorRepositoryService = new EmulatorRepositoryService(settingsService);

  const hashService = new HashService();

  const gamesService = new GamesService(win, emulatorRepositoryService, hashService, extraDataService);

  const environmentService = new EnvironmentService(extraDataService, gamesService);
  environmentService.init().then(() => {
    // finish setting up environment (e.g. update games with new extra-date) before initializing
    // other services and starting the UI
    new FilesService(win, settingsService);

    const eventLogService = new EventLogService(win);
  
    new OpenMSXLaunchService(win, settingsService, eventLogService, hashService);
    new BlueMSXLaunchService(win, settingsService, eventLogService);
  
    new EmulatorHardwareService(win, settingsService);
  
    new OpenMSXControlService(win);
  
    new RelatedGamesService(win, extraDataService, emulatorRepositoryService, gamesService);
  
    new BackupsService(win, gamesService);

    // services that are rare to execute and have internal state -> create new instance per request
    ipcMain.on('scan', (event, directories: string[], listing: string, machine: string) => {
        const scanService = new ScanService(win, extraDataService, emulatorRepositoryService, gamesService, hashService);
        scanService.start(directories, listing, machine);
    });

    initializeWindow();
  });
}

function initializeWindow() {
  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
       // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More details at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {
    });
    globalShortcut.register("CommandOrControl+W", () => {
    });
    globalShortcut.register("F5", () => {
    });
  });

  app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('CommandOrControl+W');
    globalShortcut.unregister('F5');
  });

} catch (e) {
  // Catch Error
  // throw e;
}
