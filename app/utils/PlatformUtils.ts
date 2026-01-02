import * as path from 'path'
import * as os from 'os';
import { app } from 'electron';

export class PlatformUtils {

    static getHardwarePath(openmsxPath: string, hardwareType: string): string {
        if (this.isWindows()) {
            return path.join(openmsxPath, 'share/' + hardwareType);
        } else if (this.isLinux()) {
            return path.join('/usr/share/openmsx/', hardwareType);
        } else if (this.isMacOS()) {
            return path.join(openmsxPath, 'openmsx.app/Contents/Resources/share/' + hardwareType);
        } else {
            return this.unsupportedPlatform();
        }
    }

    static getOpenmsxBinary(): string {
        if (this.isWindows()) {
            return 'openmsx.exe';
        } else if (this.isLinux()) {
            return 'openmsx';
        } else if (this.isMacOS()) {
            return 'openmsx.app/Contents/MacOS/openmsx';
        } else {
            return this.unsupportedPlatform();
        }
    }

    static getOpenmsxSoftwareDb(openmsxPath: string): string {
        if (this.isWindows()) {
            return path.join(openmsxPath, 'share/softwaredb.xml');
        } else if (this.isLinux()) {
            return '/usr/share/openmsx/softwaredb.xml';
        } else if (this.isMacOS()) {
            return path.join(openmsxPath, 'openmsx.app/Contents/Resources/share/softwaredb.xml');
        } else {
            return this.unsupportedPlatform();
        }
    }

    static getOpenmsxUserSoftwareDb(): string {
        const openmsxDataFolder = PlatformUtils.getOpenmsxDataFolder();
        return path.join(openmsxDataFolder, 'share/softwaredb.xml');
    }

    static getFileManagerCommand(file: string): string {
        if (this.isWindows()) {
            return 'explorer.exe /select, "' + file + '"';
        } else if (this.isLinux()) {
            return 'nautilus --browser "' + path.dirname(file) + '"';
        } else if (this.isMacOS()) {
            return 'open -R "' + file + '"';
        } else {
            return this.unsupportedPlatform();
        }
    }

    static getOpenmsxDataFolder(): string {
        if (this.isWindows()) {
            return path.join(app.getPath('documents'), 'openMSX');
        } else if (this.isLinux()) {
            return path.join(os.homedir(), '.openMSX');
        } else if (this.isMacOS()) {
            return path.join(os.homedir(), '.openMSX');
        } else {
            return this.unsupportedPlatform();
        }
    }

    static isWindows(): boolean {
        return os.platform() === 'win32';
    }

    static isLinux(): boolean {
        return os.platform() === 'linux';
    }

    static isMacOS(): boolean {
        return os.platform() === 'darwin';
    }

    static getGearcolecoBinary(): string {
        if (this.isWindows()) {
            return 'Gearcoleco.exe';
        } else if (this.isLinux()) {
            return 'gearcoleco';
        } else if (this.isMacOS()) {
            return 'Gearcoleco.app/Contents/MacOS/gearcoleco';
        } else {
            return this.unsupportedPlatform();
        }
    }

    private static unsupportedPlatform(): string {
        console.log('Platform not supported: ' + os.platform());
        return 'Not supported';
    }
}
