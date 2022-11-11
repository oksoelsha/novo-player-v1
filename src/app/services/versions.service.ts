import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class VersionsService {
  private ipc: IpcRenderer;

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  getExtraDataVersion(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('getExtraDataVersionResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getExtraDataVersion');
    });
  }

  getScreenshotsVersion(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('getScreenshotsVersionResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getScreenshotsVersion');
    });
  }

  getGameMusicVersion(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('getGameMusicVersionResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getGameMusicVersion');
    });
  }
}
