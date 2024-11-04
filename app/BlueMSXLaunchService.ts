import * as cp from 'child_process'
import { BrowserWindow, ipcMain } from 'electron'
import { EventLogService } from './EventLogService'
import { SettingsService } from './SettingsService'
import { Event, EventSource, EventType } from '../src/app/models/event'
import { Game } from '../src/app/models/game'
import { GameUtils } from '../src/app/models/game-utils'

export class BlueMSXLaunchService {

    private static readonly fieldsToArgs: Array<[string, string]> = [
        ['romA', 'rom1'],
        ['romB', 'rom2'],
        ['diskA', 'diskA'],
        ['diskB', 'diskB'],
        ['tape', 'cas'],
        ['harddisk', 'ide1primary'],
    ];

    private static readonly LAUNCH_ERROR_SPLIT_MSG_UNCAUGHT = 'Uncaught exception: ';
    private static readonly LAUNCH_ERROR_SPLIT_MSG_ERROR_IN = 'Error in ';

    constructor(
        private readonly win: BrowserWindow,
        private readonly settingsService: SettingsService,
        private readonly eventLogService: EventLogService,
    ) {
        this.init();
    }

    private init(): void {
        ipcMain.on('launchGameOnBlueMSX', (event, game: Game, time: number) => {
            this.launch(game, time);
        });
    }

    private launch(game: Game, time: number): void {
        const self = this;
        const options = {
            cwd: this.settingsService.getSettings().bluemsxPath,
            detached: true,
        };

        const process = cp.spawn('bluemsx.exe', this.getArguments(game), options);
        process.on('error', (error) => {
            console.log(error.message);
            let errorMessage: string;
            let splitText: string | null = self.getSplitText(error);
            if (splitText) {
                errorMessage = error.message.substring(error.message.indexOf(splitText) + splitText.length);
            } else {
                errorMessage = 'Error launching blueMSX';
            }
            self.win.webContents.send('launchGameOnBlueMSXResponse' + time, errorMessage);
        });

        process.on('close', (error: number | null) => {
            self.win.webContents.send('launchGameOnBlueMSXResponse' + time);
        });

        this.eventLogService.logEvent(new Event(EventSource.blueMSX, EventType.LAUNCH, GameUtils.getMonikor(game)));
    }

    private getSplitText(error: cp.ExecException): string | null {
        if (error.message.indexOf(BlueMSXLaunchService.LAUNCH_ERROR_SPLIT_MSG_UNCAUGHT) > 0) {
            return BlueMSXLaunchService.LAUNCH_ERROR_SPLIT_MSG_UNCAUGHT;
        } else if (error.message.indexOf(BlueMSXLaunchService.LAUNCH_ERROR_SPLIT_MSG_ERROR_IN) > 0) {
            return BlueMSXLaunchService.LAUNCH_ERROR_SPLIT_MSG_ERROR_IN;
        } else {
            return null;
        }
    }

    private getArguments(game: Game): string[] {
        const args: string[] = [];
        BlueMSXLaunchService.fieldsToArgs.forEach((field) => {
            if (game[field[0]]) {
                args.push('/' + field[1]);
                args.push(game[field[0]]);
            }
        });
        this.addOtherParams(game, args);

        return args;
    }

    private addOtherParams(game: Game, args: string[]): void {
        if (!game.bluemsxOverrideSettings) {
            this.appendParams(args, this.settingsService.getSettings().bluemsxParams);
        }
        this.appendParams(args, game.bluemsxArguments);
        // if SCC extension is set, force it on blueMSX
        if (game.extensionRom === 'scc') {
            this.appendParams(args, '/romtype1 scc');
        }
    }

    private appendParams(args: string[], argsString: string): void {
        if (argsString) {
            const params = argsString.split(/\/(?=(?:[^"]*"[^"]*")*$)/g);
            params.forEach((param) => {
                const space = param.indexOf(' ');
                if (space > -1) {
                    args.push('/' + param.substring(0, space));
                    args.push(param.substring(space + 1).replace(/"/g, ''));
                }
            });
        }
    }
}
