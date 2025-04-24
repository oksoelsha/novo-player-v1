import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { PersistenceUtils } from './utils/PersistenceUtils';
import { Backup } from '../src/app/models/backup';
import { GamesService } from './GamesService';

export class BackupsService {

    private readonly backupExtension = '.npb';
    private readonly separatorChar = '_';
    private readonly AdmZip = require('adm-zip');

    constructor(private readonly win: BrowserWindow, private readonly gamesService: GamesService) {
        this.init();
    }

    private init(): void {
        ipcMain.on('getBackups', (event) => this.getBackups());
        ipcMain.on('backupNow', (event) => this.backupNow());
        ipcMain.on('renameBackup', (event, backup: Backup, newName: string) => this.renameBackup(backup, newName));
        ipcMain.on('deleteBackup', (event, backup: Backup) => this.deleteBackup(backup));
        ipcMain.on('restoreBackup', (event, backup: Backup) => this.restoreBackup(backup));
    }

    private getBackups(): void {
        fs.readdir(PersistenceUtils.getBackupsStoragePath(), (err, files) => {
            const backups: Backup[] = [];
            if (files) {
                files.forEach(backup => {
                    const separator = backup.indexOf(this.separatorChar);
                    const lastDot = backup.lastIndexOf('.');
                    let timestamp: number;
                    let name: string;
                    if (separator > -1) {
                        timestamp = +backup.substring(0, separator);
                        name = backup.substring(separator + 1, lastDot);
                    } else {
                        timestamp = +backup.substring(0, lastDot);
                        name = null;
                    }
                    backups.push(new Backup(timestamp, name));
                });
            }
            this.win.webContents.send('getBackupsResponse', backups);
        });
    }

    private backupNow(): void {
        const backup = new Backup(Date.now());
        const filename = this.getBackupFilename(backup);
        const backupFolderPath = PersistenceUtils.getBackupsStoragePath();
        const backupFilePath = path.join(backupFolderPath, filename);

        const zip = new this.AdmZip();
        zip.addLocalFile(this.gamesService.getDatabaseFile());
        try {
            zip.writeZip(backupFilePath);
            this.win.webContents.send('backupNowResponse', backup);
        } catch (e) {
            console.log(e);
            this.win.webContents.send('backupNowResponse', null);
        }
    }

    private renameBackup(backup: Backup, newName: string): void {
        const currentFilename = this.getBackupFilename(backup);
        const newBackup = new Backup(backup.timestamp, newName);
        const newFilename = this.getBackupFilename(newBackup);
        const backupFolderPath = PersistenceUtils.getBackupsStoragePath();
        const currentFilePath = path.join(backupFolderPath, currentFilename);
        const newFilePath = path.join(backupFolderPath, newFilename);

        fs.rename(currentFilePath, newFilePath, (err) => {
            if (err) {
                console.log(err);
            }
            this.win.webContents.send('renameBackupResponse', err ? null : newBackup);
        });
    }

    private deleteBackup(backup: Backup): void {
        const filename = this.getBackupFilename(backup);
        fs.unlink(path.join(PersistenceUtils.getBackupsStoragePath(), filename), (err) => {
            if (err) {
                console.log(err);
            }
            this.win.webContents.send('deleteBackupResponse', err);
        });
    }

    private restoreBackup(backup: Backup): void {
        const filename = this.getBackupFilename(backup);
        const backupFilePath = path.join(PersistenceUtils.getBackupsStoragePath(), filename);

        try {
            const zip = new this.AdmZip(backupFilePath);
            zip.extractAllTo(PersistenceUtils.getStoragePath(), true);
            this.win.webContents.send('restoreBackupResponse');
        } catch (e) {
            console.log(e);
            this.win.webContents.send('restoreBackupResponse', true);
        }

        this.gamesService.reloadDatabase();
    }

    private getBackupFilename(backup: Backup): string {
        let filename = backup.timestamp.toString();
        if (backup.name) {
            filename += this.separatorChar + backup.name;
        }
        return filename + this.backupExtension;
    }
}
