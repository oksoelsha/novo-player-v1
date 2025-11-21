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
import { NewsService } from './NewsService';
import { ErrorLogService } from './ErrorLogService';
import { DownloadService } from './DownloadService';
import { GamePasswordsService } from './GamePasswordsService';
import { OpenMSXConnectionManager } from './OpenMSXConnectionManager';
import { EmuliciousLaunchService } from './EmuliciousLaunchService';
import { FileHunterService } from './FileHunterService';
import { OpenMSXSetupsService } from './OpenMSXSetupsService';

let win: BrowserWindow = null;

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

  const environmentService = new EnvironmentService();

  const extraDataService = new ExtraDataService(win, environmentService);

  const emulatorRepositoryService = new EmulatorRepositoryService(settingsService);

  const hashService = new HashService(win);

  // Make sure that the last service to use the environment service is the one that upgrades the internal version after
  // the one-time upgrade - the last service in this case is GamesService
  new FileHunterService(win, settingsService, environmentService);

  const gamesService = new GamesService(win, emulatorRepositoryService, hashService, extraDataService, environmentService);

  new FilesService(win, settingsService);

  const eventLogService = new EventLogService(win);
  const errorLogService = new ErrorLogService(win);

  const connectionManager = new OpenMSXConnectionManager();
  new OpenMSXLaunchService(win, settingsService, eventLogService, hashService, errorLogService, connectionManager, extraDataService);

  new BlueMSXLaunchService(win, settingsService, eventLogService);

  new EmuliciousLaunchService(win, settingsService, eventLogService);

  new EmulatorHardwareService(win, settingsService);

  new OpenMSXControlService(win, connectionManager);

  new RelatedGamesService(win, extraDataService, emulatorRepositoryService, gamesService);

  new BackupsService(win, gamesService);

  new NewsService(win, errorLogService);

  new GamePasswordsService(win);

  new DownloadService(win, extraDataService, gamesService, errorLogService);

  new OpenMSXSetupsService(win);

  // services that are rare to execute and have internal state -> create new instance per request
  ipcMain.on('scan', (event, directories: string[], listing: string, machine: string) => {
    const scanService = new ScanService(win, extraDataService, emulatorRepositoryService, gamesService, hashService);
    scanService.start(directories, listing, machine);
  });

  gamesService.checkIfNeedUpdateDbWithExtraData().then(() => {
    initializeWindow();
  });
}

function initializeWindow() {
  // Path when running electron executable
  let pathIndex = './index.html';

  if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
    // Path when running electron in local folder
    pathIndex = '../dist/index.html';
  }

  win.loadURL(url.pathToFileURL(path.join(__dirname, pathIndex)).toString());

  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (win) {
        if (win.isMinimized()) {
          win.restore();
        }
        win.focus();
      }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More details at https://github.com/electron/electron/issues/15947
    app.on('ready', () => setTimeout(createWindow, 400));

    app.on('window-all-closed', () => {
      app.quit();
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
      globalShortcut.register("CommandOrControl+Shift+R", () => {
      });
      globalShortcut.register("CommandOrControl+W", () => {
      });
      globalShortcut.register("F5", () => {
      });
    });

    app.on('browser-window-blur', function () {
      globalShortcut.unregister('CommandOrControl+R');
      globalShortcut.unregister('CommandOrControl+Shift+R');
      globalShortcut.unregister('CommandOrControl+W');
      globalShortcut.unregister('F5');
    });
  }
} catch (e) {
  console.log(e);
}
