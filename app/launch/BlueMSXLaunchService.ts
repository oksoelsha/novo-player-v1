import * as cp from 'child_process';
import { BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Event, EventSource, EventType } from '../../src/app/models/event';
import { Game } from '../../src/app/models/game';
import { ErrorLogService } from '../ErrorLogService';
import { EventLogService } from '../EventLogService';
import { SettingsService } from '../SettingsService';
import { EmulatorUtils } from '../utils/EmulatorUtils';
import { GameUtils } from '../utils/GameUtils';

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

        const binaryFullpath = this.getBlueMSXExecFullPath();
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

    private getBlueMSXExecFullPath(): string {
        const newExec = path.join(this.settingsService.getSettings().bluemsxPath, 'bluemsx+.exe');
        if (fs.existsSync(newExec)) {
            return newExec;
        } else {
            return path.join(this.settingsService.getSettings().bluemsxPath, 'bluemsx.exe');
        }
    }

    private getArguments(game: Game): string[] {
        const args: string[] = [];
        BlueMSXLaunchService.fieldsToArgs.forEach((field) => {
            if ((game as any)[field[0]]) {
                args.push('/' + field[1]);
                args.push((game as any)[field[0]]);
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
        // if SCC extension is set, force it on blueMSX if settings are not overridden
        if (game.extensionRom === 'scc' && !game.bluemsxOverrideSettings) {
            EmulatorUtils.appendParams(args, '/romtype1 scc', BlueMSXLaunchService.ARGS_SEPARATOR);
        }
    }
}
