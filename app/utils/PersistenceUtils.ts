import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PlatformUtils } from './PlatformUtils';

export class PersistenceUtils {

    static readonly fieldsToPersist: string[] = [
        'name',
        'size',
        'machine',
        'romA',
        'romB',
        'extensionRom',
        'extensionRom2',
        'diskA',
        'diskB',
        'tape',
        'harddisk',
        'laserdisc',
        'generationMSXId',
        'generations',
        'sounds',
        'genre1',
        'genre2',
        'screenshotSuffix',
        'listing',
        'fddMode',
        'inputDevice',
        'connectGFX9000',
        'favorite',
        'infoFile',
        'bluemsxArguments',
        'bluemsxOverrideSettings',
        'webmsxMachine',
        'emuliciousArguments',
        'emuliciousOverrideSettings'
    ];
    static storagePath: string;

    static getStoragePath(): string {
        let storagePath: string;
        if (this.storagePath) {
            storagePath = this.storagePath;
        } else {
            const oldStoragePath = path.join(os.homedir(), 'Novo Player');
            let defaultStoragePath: string;
            let binaryPath: string;
            if (PlatformUtils.isWindows()) {
                defaultStoragePath = path.join(os.homedir(), 'Documents\\Novo Player');
                binaryPath = process.env.PORTABLE_EXECUTABLE_DIR;
            } else if (PlatformUtils.isLinux()) {
                defaultStoragePath = path.join(os.homedir(), '.Novo Player');
                if (process.env.APPIMAGE) {
                    binaryPath = path.dirname(process.env.APPIMAGE);
                }
            } else if (PlatformUtils.isMacOS()) {
                defaultStoragePath = path.join(os.homedir(), 'Library/Application Support/Novo Player');
            } else {
                // nothing else is supported
            }
            storagePath = this.getPlatformStoragePath(oldStoragePath, defaultStoragePath, binaryPath);
            this.storagePath = storagePath;
        }
        return storagePath;
    }

    static getBackupsStoragePath(): string {
        return path.join(this.getStoragePath(), 'backups');
    }

    private static getPlatformStoragePath(oldStoragePath: string, defaultStoragePath: string, binaryPath: string): string {
        let storagePath: string;

        // first move contents of old storage path if it exists to the new default one
        if (fs.existsSync(oldStoragePath) && !fs.existsSync(defaultStoragePath)) {
            fs.mkdirSync(defaultStoragePath);
            fs.cpSync(oldStoragePath, defaultStoragePath, { recursive: true });
        }
        storagePath = defaultStoragePath;

        // now check for portable
        if (binaryPath) {
            const portablePath = path.join(binaryPath, 'portable');
            if (fs.existsSync(portablePath)) {
                storagePath = portablePath;
            } else {
                const portableFile = path.join(binaryPath, 'portable.txt');
                if (fs.existsSync(portableFile)) {
                    // This is a migration from the default location to this new portable folder
                    fs.mkdirSync(portablePath);
                    fs.cpSync(defaultStoragePath, portablePath, { recursive: true });
                    storagePath = portablePath;
                }
            }
        }

        return storagePath;
    }
}
