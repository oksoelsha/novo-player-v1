import * as cp from 'child_process';
import * as path from 'path';
import { BrowserWindow, ipcMain } from 'electron';
import { EventLogService } from './EventLogService';
import { SettingsService } from './SettingsService';
import { Event, EventSource, EventType } from '../src/app/models/event';
import { Game } from '../src/app/models/game';
import { GameUtils } from './utils/GameUtils';
import { PlatformUtils } from './utils/PlatformUtils';

export class EmuliciousLaunchService {

    constructor(
        private readonly win: BrowserWindow,
        private readonly settingsService: SettingsService,
        private readonly eventLogService: EventLogService,
    ) {
        this.init();
    }

    private init(): void {
        ipcMain.on('launchGameOnEmulicious', (event, game: Game, time: number) => {
            this.launch(game, time);
        });
    }

    private launch(game: Game, time: number): void {
        const self = this;
        const process = this.getEmuliciousProcess(game);

        process.on('error', (error) => {
            console.log(error.message);
            self.win.webContents.send('launchGameOnEmuliciousResponse' + time, 'error launching Emulicious');
        });

        process.on('close', (error: number | null) => {
            self.win.webContents.send('launchGameOnEmuliciousResponse' + time);
        });

        this.eventLogService.logEvent(new Event(EventSource.Emulicious, EventType.LAUNCH, GameUtils.getMonikor(game)));
    }

    private getEmuliciousProcess(game: Game): cp.ChildProcessWithoutNullStreams {
        if (PlatformUtils.isWindows()) {
            const options = {
                cwd: this.settingsService.getSettings().emuliciousPath,
                detached: true
            };
            return cp.spawn('Emulicious.exe', this.getWindowsArguments(game), options);
        } else {
            const options = {
                detached: true
            };
            return cp.spawn('java', this.getNonWindowsArguments(game), options);
        }
    }

    private getWindowsArguments(game: Game): string[] {
        const args: string[] = [];
        args.push(GameUtils.getGameMainFile(game));
        this.addOtherParams(game, args);

        return args;
    }

    private getNonWindowsArguments(game: Game): string[] {
        const args: string[] = [];
        args.push('-jar');
        args.push(path.join(this.settingsService.getSettings().emuliciousPath, 'Emulicious.jar'));
        args.push(GameUtils.getGameMainFile(game));
        this.addOtherParams(game, args);

        return args;
    }

    private addOtherParams(game: Game, args: string[]): void {
        if (!game.emuliciousOverrideSettings) {
            this.appendParams(args, this.settingsService.getSettings().emuliciousParams);
        }
        this.appendParams(args, game.emuliciousArguments);
    }

    private appendParams(args: string[], argsString: string) {
        if (argsString) {
            const params = argsString.split(/-(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            params.forEach((param) => {
                const space = param.indexOf(' ');
                if (space > -1) {
                    args.push('-' + param.substring(0, space));
                    args.push(param.substring(space + 1).trimEnd().replace(/"/g,''));
                }
            });
        }
    }
}
