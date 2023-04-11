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
      //      this.ipc.once('getBackupsResponse', (event, arg) => {
      //        resolve(arg);
      //      });
      //      this.ipc.send('getBackups');
      const backups: Backup[] = [];
      backups.push(new Backup(1234561, 'Back 1'));
      backups.push(new Backup(2231456, null));
      backups.push(new Backup(8511234, 'Back 3'));

      resolve(backups);
    });
  }

  async backupNow(): Promise<Backup> {
    return new Promise<Backup>((resolve, reject) => {
      resolve(new Backup(Date.now()));
    });
  }

  async deleteBackup(backup: Backup): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }

  async renameBackup(backup: Backup, newName: string): Promise<Backup> {
    return new Promise<Backup>((resolve, reject) => {
      const renamedBackup = new Backup(backup.timestamp, newName);
      resolve(renamedBackup);
    });
  }

  async restoreBackup(backup: Backup): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }
}
