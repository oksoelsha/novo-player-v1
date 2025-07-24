import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class FileHunterService {

  private ipc: IpcRenderer;

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  async getList(folder: string, pageSize: number, page: number, filter: string) {
    return new Promise<any>((resolve, reject) => {
      this.ipc.once('getFileHunterListResponse', (event, value: any) => {
        resolve(value);
      });
      this.ipc.send('getFileHunterList', folder, pageSize, page, filter);
    });
  }

  async getGameLink(filename: string) {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('getFileHunterGameLinkResponse', (event, value: string) => {
        resolve(value);
      });
      this.ipc.send('getFileHunterGameLink', filename);
    });
  }
}
