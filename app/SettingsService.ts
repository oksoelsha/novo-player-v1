import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DisplayMode, Settings } from '../src/app/models/settings';
import { UpdateListerner } from './UpdateListerner';
import { PlatformUtils } from './utils/PlatformUtils';
import { PersistenceUtils } from './utils/PersistenceUtils';

export class SettingsService {

    private settings: Settings;
    private settingsPath = PersistenceUtils.getStoragePath();
    private readonly settingsFile = path.join(this.settingsPath, 'settings.nps');
    private listeners: UpdateListerner[] = [];

    constructor(private win: BrowserWindow) {
        this.init();
    }

    getSettings(): Settings {
        if (this.settings === undefined) {
            if (!fs.existsSync(this.settingsFile)) {
                return new Settings(this.getSuggestedOpenMSXPath(), '', '', '', '', '', '', '', false, DisplayMode[0], '', '', false);
            } else {
                const fileData = fs.readFileSync(this.settingsFile).toString();
                return this.setSettingsWithDefaults(fileData);
            }
        } else {
            return this.settings;
        }
    }

    addListerner(listener: UpdateListerner) {
        this.listeners.push(listener);
    }

    private init() {
        this.createFolderIfNecessary();

        ipcMain.on('getSettings', (event, arg) => {
            this.settings = this.getSettings();
            this.win.webContents.send('getSettingsResponse', this.settings);
        });

        ipcMain.on('saveSettings', (event, arg) => {
            this.saveSettings(arg);
        });
    }

    private saveSettings(settings: Settings) {
        const data = JSON.stringify(settings);
        fs.writeFileSync(this.settingsFile, data);
        this.settings = settings;
        this.updateListerners();
    }

    private createFolderIfNecessary() {
        if (!fs.existsSync(this.settingsPath)) {
            fs.mkdirSync(this.settingsPath);
        }
    }

    private updateListerners() {
        this.listeners.forEach((listener) => {
            listener.reinit();
        });
    }

    private getSuggestedOpenMSXPath(): string {
        if (PlatformUtils.isWindows()) {
            return 'C:\\Program Files\\openMSX';
        } else if (PlatformUtils.isLinux()) {
            return '/usr/bin';
        } else if (PlatformUtils.isMacOS()) {
            return '/Applications';
        } else {
            return '';
        }
    }

    private setSettingsWithDefaults(settingsData: string): Settings {
        const settings = JSON.parse(settingsData);
        if (!settings.displayMode) {
            settings.displayMode = DisplayMode[0];
        }
        return settings;
    }
}
