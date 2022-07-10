import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IpcRenderer } from 'electron';
import { PlatformService } from '../../../services/platform.service';

@Component({
  selector: 'app-window-controls',
  templateUrl: './window-controls.component.html',
  styleUrls: ['./window-controls.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowControlsComponent {

  @Input() titleImg: string;
  readonly isWindows = this.platformService.isOnWindows();
  maximizedClass = '';
  private ipc: IpcRenderer;

  // the custom window controls were taken from
  // https://github.com/binaryfunt/electron-seamless-titlebar-tutorial
  // and modified to fit in an Electron-Angular app

  constructor(private platformService: PlatformService) {
    this.ipc = window.require('electron').ipcRenderer;

    this.ipc.on('windowMaximizedEvent', (event: any) => {
      this.handleMaximizedEvent();
    });
    this.ipc.on('windowUnmaximizedEvent', (event: any) => {
      this.handleUnmaximizedEvent();
    });
  }

  minimizeMainWindow() {
    this.ipc.send('minimizeMainWindow');
  }

  maximizeMainWindow() {
    this.ipc.send('maximizeMainWindow');
  }

  restoreMainWindow() {
    this.ipc.send('restoreMainWindow');
  }

  closeMainWindow() {
    this.ipc.send('closeMainWindow');
  }

  private handleMaximizedEvent() {
    this.maximizedClass = 'maximized';

    // we have to access the document directly because changing the maximizedClass
    // value above didn't trigger the two-way binding in Angular
    document.getElementById('titlebar').classList.add('maximized');
  }

  private handleUnmaximizedEvent() {
      this.maximizedClass = '';

      // the same reason as above
      document.getElementById('titlebar').classList.remove('maximized');
  }
}
