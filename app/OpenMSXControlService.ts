import { BrowserWindow, ipcMain } from 'electron';
import { Game } from '../src/app/models/game';
import { OpenMSXConnector } from './OpenMSXConnector';

export class OpenMSXControlService {

    constructor(private win: BrowserWindow) {
        this.init();
    }

    private init() {
        ipcMain.on('resetOnOpenmsx', (event, pid: number) => {
            this.resetOnOpenmsx(pid);
        });
        ipcMain.on('switchDiskOnOpenmsx', (event, pid: number, disk: string) => {
            this.switchDiskOnOpenmsx(pid, disk);
        });
        ipcMain.on('switchTapeOnOpenmsx', (event, pid: number, tape: string) => {
            this.switchTapeOnOpenmsx(pid, tape);
        });
        ipcMain.on('takeScreenshotOnOpenmsx', (event, pid: number, game: Game) => {
            this.takeScreenshotOnOpenmsx(pid, game);
        });
    }

    private async resetOnOpenmsx(pid: number) {
        this.executeCommandOnOpenmsx(pid, 'reset');

        this.win.webContents.send('resetOnOpenmsxResponse', true);
    }

    private async switchDiskOnOpenmsx(pid: number, disk: string) {
        this.executeCommandOnOpenmsx(pid, 'diska {' + disk.replace(/\\/g, '/') + '}');

        this.win.webContents.send('switchDiskOnOpenmsxResponse', true);
    }

    private async switchTapeOnOpenmsx(pid: number, tape: string) {
        this.executeCommandOnOpenmsx(pid, 'cassetteplayer {' + tape.replace(/\\/g, '/') + '}');

        this.win.webContents.send('switchTapeOnOpenmsxResponse', true);
    }

    private async takeScreenshotOnOpenmsx(pid: number, game: Game) {
        let screenshotName: string;
        if (game.generationMSXId > 0) {
            screenshotName = game.generationMSXId.toString();
            if (game.screenshotSuffix) {
                screenshotName += game.screenshotSuffix;
            }
        } else {
            screenshotName = game.sha1Code;
        }
        this.executeCommandOnOpenmsx(pid, 'screenshot -prefix ' + screenshotName + '-');

        this.win.webContents.send('takeScreenshotOnOpenmsxResponse', true);
    }

    private async executeCommandOnOpenmsx(pid: number, command: string) {
        const openmsxConnector = new OpenMSXConnector(pid);

        await openmsxConnector.connect();
        await openmsxConnector.sendCommand(command);
        openmsxConnector.disconnect();
    }
}
