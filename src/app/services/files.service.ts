import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Medium } from '../models/medium';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private ipc: IpcRenderer;
  private cachedFileGroup = new Map<string, string[]>();

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  async useFileSystemDialog(options: object) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('useFileSystemDialogResponse', (event, value: any) => {
        resolve(value);
      });
      this.ipc.send('useFileSystemDialog', options);
    });
  }

  getFileGroup(id: number, medium: Medium, file: string): Promise<string[]> {
    const cachedValue = this.cachedFileGroup.get(file);
    if (cachedValue) {
      return Promise.resolve(cachedValue);
    } else {
      return new Promise<string[]>((resolve, reject) => {
        this.ipc.once('getFileGroupResponse' + id, (event: any, fileGroup: string[]) => {
          this.cachedFileGroup.set(file, fileGroup);
          resolve(fileGroup);
        });
        this.ipc.send('getFileGroup', id, medium, file);
      });
    }
  }
}
