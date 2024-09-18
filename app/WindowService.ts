import { BrowserWindow, ipcMain } from 'electron';

export class WindowService {

    constructor(private win: BrowserWindow) {
        this.init();
    }

    private init(): void {
        ipcMain.on('minimizeMainWindow', (event: any) => {
            this.win.minimize();
        });

        ipcMain.on('maximizeMainWindow', (event: any) => {
            this.win.maximize();
        });

        ipcMain.on('restoreMainWindow', (event: any) => {
            this.win.restore();
        });

        ipcMain.on('closeMainWindow', (event: any) => {
            this.win.close();
        });

        ipcMain.on('zoomIn', (event: any) => {
            this.win.webContents.zoomFactor = this.win.webContents.getZoomFactor() + 0.1;
        });

        this.win.on('maximize', () => {
            this.win.webContents.send('windowMaximizedEvent');
        });

        this.win.on('unmaximize', () => {
            this.win.webContents.send('windowUnmaximizedEvent');
        });
    }
}
