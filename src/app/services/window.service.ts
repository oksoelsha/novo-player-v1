import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private ipc: IpcRenderer;

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  zoom(key: any, event: any = null) {
    switch (key) {
      case '=':
        this.ipc.send('zoomIn');
        break;
      case '-':
        this.ipc.send('zoomOut');
        break;
      case '0':
        this.ipc.send('zoomReset');
        break;
    }
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
}
