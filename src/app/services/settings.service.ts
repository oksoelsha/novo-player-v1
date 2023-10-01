import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Settings } from '../models/settings';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private ipc: IpcRenderer;
  private subject = new Subject<Settings>();

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  async getSettings(): Promise<Settings> {
    return new Promise<Settings>((resolve, reject) => {
      this.ipc.once('getSettingsResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getSettings');
    });
  }

  saveSettings(settings: Settings) {
    this.ipc.send('saveSettings', settings);
    this.subject.next(settings);
  }

  getUpdatedSettings(): Observable<Settings> {
    return this.subject.asObservable();
  }
}
