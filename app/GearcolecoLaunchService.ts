import * as cp from 'child_process';
import { BrowserWindow, ipcMain } from 'electron';
import { EventLogService } from './EventLogService';
import { SettingsService } from './SettingsService';
import { Event, EventSource, EventType } from '../src/app/models/event';
import { Game } from '../src/app/models/game';
import { GameUtils } from './utils/GameUtils';
import { PlatformUtils } from './utils/PlatformUtils';

export class GearcolecoLaunchService {

    constructor(
        private readonly win: BrowserWindow,
        private readonly settingsService: SettingsService,
        private readonly eventLogService: EventLogService,
    ) {
        this.init();
    }

    private init(): void {
        ipcMain.on('launchGameOnGearcoleco', (event, game: Game, time: number) => {
            this.launch(game, time);
        });
    }

    private launch(game: Game, time: number): void {
        const self = this;
        const process = this.getGearcolecoProcess(game);

        process.on('error', (error) => {
            console.log(error.message);
            self.win.webContents.send('launchGameOnGearcolecoResponse' + time, 'error launching Gearcoleco');
        });

        process.on('close', (error: number | null) => {
            self.win.webContents.send('launchGameOnGearcolecoResponse' + time);
        });

        this.eventLogService.logEvent(new Event(EventSource.Gearcoleco, EventType.LAUNCH, GameUtils.getMonikor(game)));
    }

    private getGearcolecoProcess(game: Game): cp.ChildProcessWithoutNullStreams {
        const options = {
            cwd: this.settingsService.getSettings().gearcolecoPath,
            detached: true
        };
        return cp.spawn(PlatformUtils.getGearcolecoBinary(), this.getArguments(game), options);
    }

    private getArguments(game: Game): string[] {
        const args: string[] = [];
        args.push(GameUtils.getGameMainFile(game));

        return args;
    }
}
