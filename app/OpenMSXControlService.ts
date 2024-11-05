import { BrowserWindow, ipcMain } from 'electron';
import { Game } from '../src/app/models/game';
import { GamePassword } from '../src/app/models/game-passwords-info';
import { OpenMSXConnectionManager } from './OpenMSXConnectionManager';
import EventEmitter from 'events';
import pLimit from 'p-limit';

export class OpenMSXControlService {

    private updateEmitter = new EventEmitter();
    private readonly modifiedGameNamesForTrainer: Map<string, string> = new Map();
    private commandsBatchSize = pLimit(1);

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
        ipcMain.on('togglePauseOnOpenmsx', (event, pid: number) => {
            this.togglePauseOnOpenmsx(pid);
        });
        ipcMain.on('toggleMuteOnOpenmsx', (event, pid: number) => {
            this.toggleMuteOnOpenmsx(pid);
        });
        ipcMain.on('toggleFullscreenOnOpenmsx', (event, pid: number) => {
            this.toggleFullscreenOnOpenmsx(pid);
        });
        ipcMain.on('setSpeedOnOpenmsx', (event, pid: number, speed: number) => {
            this.setSpeedOnOpenmsx(pid, speed);
        });
        ipcMain.on('getTrainerFromOpenmsx', (event, pid: number, gameName: string) => {
            this.getTrainerFromOpenmsx(pid, gameName);
        });
        ipcMain.on('setCheatOnOpenmsx', (event, pid: number, gameName: string, cheat: string) => {
            this.setCheatOnOpenmsx(pid, gameName, cheat);
        });
        ipcMain.on('setAllCheatsOnOpenmsx', (event, pid: number, gameName: string, flag: boolean) => {
            this.setAllCheatsOnOpenmsx(pid, gameName, flag);
        });
        ipcMain.on('getScreenNumber', (event, pid: number) => {
            this.getScreenNumber(pid);
        });
        this.connectionManager.registerEventEmitter(this.updateEmitter);
        this.updateEmitter.on('openmsxUpdate', (pid: number, type: string, name: string, value: string) => {
            this.handleOpenmsxUpdateEvents(pid, type, name, value);
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

    private async togglePauseOnOpenmsx(pid: number) {
        this.executeCommandOnOpenmsx(pid, 'toggle pause').then(result => {
            this.win.webContents.send('togglePauseOnOpenmsxResponse', result.success);
        });
    }

    private async toggleMuteOnOpenmsx(pid: number) {
        this.executeCommandOnOpenmsx(pid, 'toggle mute').then(result => {
            this.win.webContents.send('toggleMuteOnOpenmsxResponse', result.success);
        });
    }

    private async toggleFullscreenOnOpenmsx(pid: number) {
        this.executeCommandOnOpenmsx(pid, 'toggle fullscreen').then(result => {
            this.win.webContents.send('toggleFullscreenOnOpenmsxResponse', result.success);
        });
    }

    private async setSpeedOnOpenmsx(pid: number, speed: number) {
        this.executeCommandOnOpenmsx(pid, 'set speed ' + speed).then(result => {
            this.win.webContents.send('setSpeedOnOpenmsxResponse', result.success);
        });
    }

    private async getTrainerFromOpenmsx(pid: number, gameName: string, gameNameBeforeModification: string = null) {
        this.executeCommandOnOpenmsx(pid, 'trainer "' + gameName + '"').then(result => {
            if (!gameNameBeforeModification && !result.success && gameName.startsWith('The ')) {
                // Need to account for name differences between openMSX softwaredb and the _trainerdefs.tcl script for
                // games that start with 'The'. In this case we'll try a second time after moving 'The' to the end of the name.
                // Note: games that start with 'The' and don't have trainers will always be searched twice. That's fine as
                // it allows for trainer definitions to be added without having to restart Novo Player.
                const modifiedGameName = gameName.substring('The '.length) + ', The';
                this.getTrainerFromOpenmsx(pid, modifiedGameName, gameName);
            } else {
                const cheats: any[] = [];
                if (result.success) {
                    const trainer = result.content.split(' [');
                    for (let ix = 1; ix < trainer.length; ix++) {
                        cheats.push({ on: trainer[ix].startsWith('x'), label: trainer[ix].split('&#x0a;')[0].substring(3) });
                    }
                    if (cheats.length > 1 && gameNameBeforeModification) {
                        this.modifiedGameNamesForTrainer.set(gameNameBeforeModification, gameName);
                    }
                }
                this.win.webContents.send('getTrainerFromOpenmsxResponse' + pid, result.success, cheats);
            }
        });
    }

    private async setCheatOnOpenmsx(pid: number, gameName: string, cheat: string) {
        const gameNameToUse = this.getModifiedGameNameIfNeeded(gameName);
        this.executeCommandOnOpenmsx(pid, 'trainer "' + gameNameToUse + '" "' + cheat + '"').then(result => {
            this.win.webContents.send('setCheatOnOpenmsxResponse' + pid, result.success);
        });
    }

    private async setAllCheatsOnOpenmsx(pid: number, gameName: string, flag: boolean) {
        const gameNameToUse = this.getModifiedGameNameIfNeeded(gameName);
        this.executeCommandOnOpenmsx(pid, 'trainer "' + gameNameToUse + '"').then(result => {
            if (result.success) {
                const trainer = result.content.split(' [');
                let cheats: string[] = [];
                for (let ix = 1; ix < trainer.length; ix++) {
                    if (trainer[ix].startsWith('x') !== flag) {
                        cheats.push('"' + trainer[ix].split('&#x0a;')[0].substring(3) + '"');
                    }
                }
                this.executeCommandOnOpenmsx(pid, 'trainer "' + gameNameToUse + '" ' + cheats.join(' ')).then(result => {
                    this.win.webContents.send('setAllCheatsOnOpenmsxResponse' + pid, result.success);
                });
            }
        });
    }

    private async getScreenNumber(pid: number) {
        this.executeCommandOnOpenmsx(pid, 'get_screen_mode_number').then(result => {
            this.win.webContents.send('getScreenNumberResponse', result?.content);
        }).catch(() => {
            // ignore for now
        });
    }

    private handleOpenmsxUpdateEvents(pid: number, type: string, name: string, value: string) {
        if (type === 'setting') {
            let eventName: string;
            if (name.startsWith('led_')) {
                eventName = name.substring(name.indexOf('_') + 1);
            } else {
                eventName = name;
            }
            this.win.webContents.send('openmsxUpdateEvent', pid, eventName, value);
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

    private getModifiedGameNameIfNeeded(gameName: string): string {
        const modifiedName = this.modifiedGameNamesForTrainer.get(gameName);
        return modifiedName ? modifiedName : gameName;
    }

    private async executeCommandOnOpenmsx(pid: number, command: string) {
        return this.commandsBatchSize(() => this.connectionManager.executeCommand(pid, command));
    }
}
