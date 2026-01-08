import * as cp from 'child_process';
import * as path from 'path';
import { BrowserWindow, ipcMain } from 'electron';
import { EventLogService } from '../EventLogService';
import { SettingsService } from '../SettingsService';
import { Event, EventSource, EventType } from '../../src/app/models/event';
import { Game } from '../../src/app/models/game';
import { GameUtils } from '../utils/GameUtils';
import { EmulatorUtils } from '../utils/EmulatorUtils';
import { ErrorLogService } from '../ErrorLogService';

export class BlueMSXLaunchService {

    private static readonly fieldsToArgs: Array<[string, string]> = [
        ['romA', 'rom1'],
        ['romB', 'rom2'],
        ['diskA', 'diskA'],
        ['diskB', 'diskB'],
        ['tape', 'cas'],
        ['harddisk', 'ide1primary'],
    ];

    private static readonly ARGS_SEPARATOR = '\/';

    constructor(
        private readonly win: BrowserWindow,
        private readonly settingsService: SettingsService,
        private readonly eventLogService: EventLogService,
        private readonly errorLogService: ErrorLogService
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
        let errorMessage: string;

        const binaryFullpath = path.join(this.settingsService.getSettings().bluemsxPath, 'bluemsx.exe');
        const process = cp.spawn(binaryFullpath, this.getArguments(game), options);
        process.on('error', (error) => {
            console.log(error.message);
            errorMessage = 'Error launching blueMSX - ' + error.message;
        });

        process.on('close', (error: number | null) => {
            if (error) {
                this.errorLogService.logError('blueMSX:', errorMessage);
            }
            self.win.webContents.send('launchGameOnBlueMSXResponse' + time, error !== 0 ? errorMessage : null);
        });

        this.eventLogService.logEvent(new Event(EventSource.blueMSX, EventType.LAUNCH, GameUtils.getMonikor(game)));
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
            EmulatorUtils.appendParams(args, this.settingsService.getSettings().bluemsxParams, BlueMSXLaunchService.ARGS_SEPARATOR);
        }
        EmulatorUtils.appendParams(args, game.bluemsxArguments, BlueMSXLaunchService.ARGS_SEPARATOR);
        // if SCC extension is set, force it on blueMSX
        if (game.extensionRom === 'scc') {
            EmulatorUtils.appendParams(args, '/romtype1 scc', BlueMSXLaunchService.ARGS_SEPARATOR);
        }
    }
}
