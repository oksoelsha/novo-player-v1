import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private ipc: IpcRenderer;

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
}
