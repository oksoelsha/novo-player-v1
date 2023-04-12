import * as os from 'os';
import * as path from 'path';

export class PersistenceUtils {

    static readonly fieldsToPersist: string[] = [
        'name',
        'size',
        'machine',
        'romA',
        'romB',
        'extensionRom',
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
        'webmsxMachine'
    ];

    static getStoragePath(): string {
        return path.join(os.homedir(), 'Novo Player');
    }

    static getBackupsStoragePath(): string {
        return path.join(this.getStoragePath(), 'backups');
    }
}
