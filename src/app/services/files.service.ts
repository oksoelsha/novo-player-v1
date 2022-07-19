import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

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

  getFileGroup(id: number, medium: string): Promise<string[]> {
    const cachedValue = this.cachedFileGroup.get(medium);
    if (cachedValue) {
      return Promise.resolve(cachedValue);
    } else {
      return new Promise<string[]>((resolve, reject) => {
        this.ipc.once('getFileGroupResponse' + id, (event: any, fileGroup: string[]) => {
          this.cachedFileGroup.set(medium, fileGroup);
          resolve(fileGroup);
        });
        this.ipc.send('getFileGroup', id, medium);
      });
    }
  }
}
