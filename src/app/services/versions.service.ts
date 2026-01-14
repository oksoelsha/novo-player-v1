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

  getColecoScreenshotsVersion(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('getColecoScreenshotsVersionResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getColecoScreenshotsVersion');
    });
  }

  getSpectravideoScreenshotsVersion(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('getSpectravideoScreenshotsVersionResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getSpectravideoScreenshotsVersion');
    });
  }

  getSegaScreenshotsVersion(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('getSegaScreenshotsVersionResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getSegaScreenshotsVersion');
    });
  }

  async getVersionsOnServer(): Promise<Map<string, string>> {
    const versions = await this.getScreenshotsVersionOnServer();
    const moreVersions = await this.getNovoVersionsOnServer();
    moreVersions.forEach((v, k) => {
      versions.set(k, v);
    });

    return Promise.resolve(versions);
  }

  private async getScreenshotsVersionOnServer(): Promise<Map<string, string>> {
    const url = 'http://msxlaunchers.info/openmsx-launcher/versions';
    return fetch(url)
      .then(res => res.text())
      .then(res => {
        return this.processVersions(res);
      });
  }

  private async getNovoVersionsOnServer(): Promise<Map<string, string>> {
    const url = 'http://msxlaunchers.info/novo-player/novo-versions';
    return fetch(url)
      .then(res => res.text())
      .then(res => {
        return this.processVersions(res);
      });
  }

  private processVersions(data: string): Map<string, string> {
    const versions = new Map<string, string>();
    const lines = data.split(/\r?\n/);
    lines.forEach(line => {
      const parts = line.split('=');
      if (parts && parts.length === 2) {
        versions.set(parts[0], parts[1]);
      }
    });
    return versions;
  }
}
