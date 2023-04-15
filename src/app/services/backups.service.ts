import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { rename } from 'fs';
import { Backup } from '../models/backup';

@Injectable({
  providedIn: 'root'
})
export class BackupsService {

  private ipc: IpcRenderer;

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  async getBackups(): Promise<Backup[]> {
    return new Promise<Backup[]>((resolve, reject) => {
      this.ipc.once('getBackupsResponse', (event, backups) => {
        resolve(backups);
      });
      this.ipc.send('getBackups');
    });
  }

  async backupNow(): Promise<Backup> {
    return new Promise<Backup>((resolve, reject) => {
      this.ipc.once('backupNowResponse', (event, backup) => {
        if (backup) {
          resolve(backup);
        } else {
          reject();
        }
      });
      this.ipc.send('backupNow');
    });
  }

  async deleteBackup(backup: Backup): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ipc.once('deleteBackupResponse', (event, err) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
      this.ipc.send('deleteBackup', backup);
    });
  }

  async renameBackup(backup: Backup, newName: string): Promise<Backup> {
    return new Promise<Backup>((resolve, reject) => {
      this.ipc.once('renameBackupResponse', (event, renamedBackup) => {
        if (renamedBackup) {
          resolve(renamedBackup);
        } else {
          reject();
        }
      });
      this.ipc.send('renameBackup', backup, newName);
    });
  }

  async restoreBackup(backup: Backup): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ipc.once('restoreBackupResponse', (event, err) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
      this.ipc.send('restoreBackup', backup);
    });
  }
}
