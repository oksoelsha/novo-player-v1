import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private ipc: IpcRenderer;

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  async downloadNewExtraData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ipc.once('downloadNewExtraDataResponse', (event, err) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
      this.ipc.send('downloadNewExtraData');
    });
  }
}
