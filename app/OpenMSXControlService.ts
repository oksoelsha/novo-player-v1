import { BrowserWindow, ipcMain } from 'electron';
import { Game } from '../src/app/models/game';
import { GamePassword } from '../src/app/models/game-passwords-info';
import { OpenMSXConnectionManager } from './OpenMSXConnectionManager';
import EventEmitter from 'events';

export class OpenMSXControlService {

    private updateEmitter = new EventEmitter();

    constructor(private win: BrowserWindow, private connectionManager: OpenMSXConnectionManager) {
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
        ipcMain.on('saveStateOnOpenmsx', (event, pid: number, game: Game) => {
            this.saveStateOnOpenmsx(pid, game);
        });
        ipcMain.on('loadStateOnOpenmsx', (event, pid: number, state: string) => {
            this.loadStateOnOpenmsx(pid, state);
        });
        ipcMain.on('typeTextOnOpenmsx', (event, pid: number, text: string) => {
            this.typeTextOnOpenmsx(pid, text);
        });
        ipcMain.on('typePasswordOnOpenmsx', (event, pid: number, gamePassword: GamePassword) => {
            this.typePasswordOnOpenmsx(pid, gamePassword.password, gamePassword.pressReturn);
        });
        this.connectionManager.registerEventEmitter(this.updateEmitter);
        this.updateEmitter.on('openmsxUpdate', (pid: number, type: string, name: string, state: string) => {
            this.handleOpenmsxUpdateEvents(pid, type, name, state);
        });
    }

    private async resetOnOpenmsx(pid: number) {
        this.executeCommandOnOpenmsx(pid, 'reset').then(result => {
            this.win.webContents.send('resetOnOpenmsxResponse', result.success);
        });
    }

    private async switchDiskOnOpenmsx(pid: number, disk: string) {
        this.executeCommandOnOpenmsx(pid, 'diska {' + disk.replace(/\\/g, '/') + '}').then(result => {
            this.win.webContents.send('switchDiskOnOpenmsxResponse', result.success);
        });
    }

    private async switchTapeOnOpenmsx(pid: number, tape: string) {
        this.executeCommandOnOpenmsx(pid, 'cassetteplayer {' + tape.replace(/\\/g, '/') + '}').then(result => {
            this.win.webContents.send('switchTapeOnOpenmsxResponse', result.success);
        });
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
        this.executeCommandOnOpenmsx(pid, 'screenshot -prefix ' + screenshotName + '-').then(result => {
            this.win.webContents.send('takeScreenshotOnOpenmsxResponse', result.success);
        });
    }

    private async saveStateOnOpenmsx(pid: number, game: Game) {
        const sanitizedName = game.name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').replace(/ |\[|\]/g, '_');
        this.executeCommandOnOpenmsx(pid, 'savestate ' + game.sha1Code + '-' + sanitizedName + '-' +  Date.now()).then(result => {
            this.win.webContents.send('saveStateOnOpenmsxResponse', result.success);
        });
    }

    private async loadStateOnOpenmsx(pid: number, state: string) {
        this.executeCommandOnOpenmsx(pid, 'loadstate ' + state).then(result => {
            this.win.webContents.send('loadStateOnOpenmsxResponse', result.success);
        });
    }

    private async typeTextOnOpenmsx(pid: number, text: string) {
        let sanitizedText = this.escapeText(text);
        this.executeCommandOnOpenmsx(pid, 'type "' + sanitizedText + '"').then(result => {
            this.win.webContents.send('typeTextOnOpenmsxResponse', result.success);
        });
    }

    private async typePasswordOnOpenmsx(pid: number, password: string, autoPressEnter: boolean) {
        let sanitizedText = this.escapeText(password);
        if (autoPressEnter) {
            sanitizedText = sanitizedText + '\r';
        }
        this.executeCommandOnOpenmsx(pid, 'type -release "' + sanitizedText + '"').then(result => {
            this.win.webContents.send('typePasswordOnOpenmsxResponse', result.success);
        });
    }

    private handleOpenmsxUpdateEvents(pid: number, type: string, name: string, state: string) {
        if (type === 'setting') {
            if (name.startsWith('led_')) {
                const led = name.substring(name.indexOf('_') + 1);
                this.win.webContents.send('openmsxUpdateEvent', pid, led, state === 'on');
            } else if (name === 'pause') {
                this.win.webContents.send('openmsxUpdateEvent', pid, name, state === 'true');
            }
        }
    }

    private escapeText(text: string) {
        let escapedText = text;

        escapedText = escapedText.split('\\').join('\\\\');
        escapedText = escapedText.split('"').join('\\\"');
        escapedText = escapedText.split('\n').join('\r');
        escapedText = escapedText.split('[').join('\\[');
        escapedText = escapedText.split('$').join('\\$');
        escapedText = escapedText.split('&').join('&amp;');
        escapedText = escapedText.split('<').join('&lt;');

        return escapedText;
    }

    private async executeCommandOnOpenmsx(pid: number, command: string) {
        return this.connectionManager.executeCommand(pid, command);
    }
}
