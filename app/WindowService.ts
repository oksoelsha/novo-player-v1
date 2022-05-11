import { BrowserWindow, ipcMain } from 'electron';

export class WindowService {

    constructor(private win: BrowserWindow) {
        this.init();
    }

    private init() {
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

        this.win.on('maximize', () => {
            this.win.webContents.send('windowMaximizedEvent');
        });
        this.win.on('unmaximize', () => {
            this.win.webContents.send('windowUnmaximizedEvent');            
        });
    }
}
