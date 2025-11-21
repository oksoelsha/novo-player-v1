import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { OpenmsxSetup } from '../models/openmsx-setup';

@Injectable({
  providedIn: 'root'
})
export class OpenmsxSetupsService {
  private ipc: IpcRenderer;

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  async save(setup: OpenmsxSetup) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('saveOpenmsxSetupResponse', (event, saved: boolean) => {
        resolve(saved);
      });
      this.ipc.send('saveOpenmsxSetup', setup);
    });
  }

  async getSetups(): Promise<OpenmsxSetup[]> {
    return new Promise<OpenmsxSetup[]>((resolve, reject) => {
      this.ipc.once('getOpenmsxSetupsResponse', (event, setups) => {
        setups.sort((a: OpenmsxSetup, b: OpenmsxSetup) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        resolve(setups);
      });
      this.ipc.send('getOpenmsxSetups');
    });
  }

  async delete(setup: OpenmsxSetup) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('deleteOpenmsxSetupResponse', (event, deleted: boolean) => {
        resolve(deleted);
      });
      this.ipc.send('deleteOpenmsxSetup', setup);
    });
  }
}
