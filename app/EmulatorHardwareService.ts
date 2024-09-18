import { BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { SettingsService } from './SettingsService'
import { FileTypeUtils } from './utils/FileTypeUtils';
import { PlatformUtils } from './utils/PlatformUtils';

export class EmulatorHardwareService {

    private static readonly HARDWARE_CONFIG_FILENAME = 'hardwareconfig.xml';

    constructor(private readonly win: BrowserWindow, private readonly settingsService: SettingsService) {
        this.init();
    }

    private init(): void {
        ipcMain.on('getMachines', (event, arg) => {
            const machines = this.getFromEmulator('machines');
            this.win.webContents.send('getMachinesResponse', machines);
        });

        ipcMain.on('getExtensions', (event, arg) => {
            const extensions = this.getFromEmulator('extensions');
            this.win.webContents.send('getExtensionsResponse', extensions);
        });
    }

    private getFromEmulator(hardware: string): string[] {
        const openMSXPath = this.settingsService.getSettings().openmsxPath;
        const hardwarePath = PlatformUtils.getHardwarePath(openMSXPath, hardware);
        const hardwareList: string[] = [];

        if (fs.existsSync(hardwarePath)) {
            const hardwareDirectory = fs.readdirSync(hardwarePath, 'utf8');
            hardwareDirectory.forEach(file => {
                const hardwareFullPath: string = path.join(hardwarePath, file);
                if (fs.statSync(hardwareFullPath).isFile()) {
                    if (FileTypeUtils.isXML(hardwareFullPath)) {
                        hardwareList.push(FileTypeUtils.getFilenameWithoutExt(path.basename(hardwareFullPath)));
                    }
                } else {
                    const hardwareConfigFile: string = path.join(hardwareFullPath, EmulatorHardwareService.HARDWARE_CONFIG_FILENAME);
                    if (fs.existsSync(hardwareConfigFile)) {
                        hardwareList.push(path.basename(hardwareFullPath));
                    }
                }
            });
        }

        return hardwareList;
    }
}
