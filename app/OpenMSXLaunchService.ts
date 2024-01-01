import * as cp from 'child_process'
import * as fs from 'fs';
import * as path from 'path';
import { BrowserWindow, ipcMain } from 'electron'
import { EventLogService } from './EventLogService'
import { SettingsService } from './SettingsService'
import { Event, EventSource, EventType } from '../src/app/models/event'
import { Game } from '../src/app/models/game'
import { GameUtils } from '../src/app/models/game-utils'
import { PlatformUtils } from './utils/PlatformUtils'
import { QuickLaunchData } from '../src/app/models/quick-launch-data'
import { HashService } from './HashService'
import { FileTypeUtils } from './utils/FileTypeUtils';
import { ErrorLogService } from './ErrorLogService';
import { OpenMSXConnectionManager } from './OpenMSXConnectionManager';

class TCLCommands {
    field: string;
    argCommands: string[][];

    constructor(field: string, argCommands: string[][]) {
        this.field = field;
        this.argCommands = argCommands;
    }
}

export class OpenMSXLaunchService {

    private static readonly fieldsToArgs = [
        ['machine', 'machine'],
        ['romA', 'carta'],
        ['romB', 'cartb'],
        ['diskA', 'diska'],
        ['diskB', 'diskb'],
        ['tape', 'cassetteplayer'],
        ['harddisk', 'hda'],
        ['extensionRom', 'ext'],
        ['laserdisc', 'laserdisc']
    ];

    private static readonly Input_Device_JOYSTICK = 'plug joyporta joystick1';
    private static readonly Input_Device_JOYSTICK_KEYBOARD = 'plug joyporta keyjoystick1';
    private static readonly Input_Device_MOUSE = 'plug joyporta mouse';
    private static readonly Input_Device_ARKANOID_PAD = 'plug joyporta arkanoidpad';
    private static readonly Input_Device_TRACKBALL = 'plug joyportb trackball';
    private static readonly Input_Device_TOUCHPAD = 'plug joyportb touchpad';
    private static readonly Input_Device_MAGICKEY = 'plug joyportb magic-key';
    private static readonly Input_Device_NINJATAP = 'plug joyporta ninjatap';
    private static readonly Input_Device_TETRIS2PROTECTION = 'plug joyportb tetris2-protection';
    private static readonly Input_Device_PADDLE = 'plug joyporta paddle';

    private static readonly FDD_MODE_DISABLE_SECOND = 'after boot { keymatrixdown 6 2; after time 14 \"keymatrixup 6 2\" }';
    private static readonly FDD_MODE_DISABLE_BOTH = 'after boot { keymatrixdown 6 1; after time 14 \"keymatrixup 6 1\" }';

    private static readonly ENABLE_GFX9000_CMD = 'ext gfx9000; after time 10 \"set videosource GFX9000\"';

    private static readonly tclCommandArgs: TCLCommands[] = [
        new TCLCommands('inputDevice', [
            ['1', OpenMSXLaunchService.Input_Device_JOYSTICK],
            ['2', OpenMSXLaunchService.Input_Device_JOYSTICK_KEYBOARD],
            ['3', OpenMSXLaunchService.Input_Device_MOUSE],
            ['4', OpenMSXLaunchService.Input_Device_ARKANOID_PAD],
            ['5', OpenMSXLaunchService.Input_Device_TRACKBALL],
            ['6', OpenMSXLaunchService.Input_Device_TOUCHPAD],
            ['7', OpenMSXLaunchService.Input_Device_MAGICKEY],
            ['8', OpenMSXLaunchService.Input_Device_NINJATAP],
            ['9', OpenMSXLaunchService.Input_Device_TETRIS2PROTECTION],
            ['10', OpenMSXLaunchService.Input_Device_PADDLE]
        ])
        ,
        new TCLCommands('fddMode', [
            ['1', OpenMSXLaunchService.FDD_MODE_DISABLE_SECOND],
            ['2', OpenMSXLaunchService.FDD_MODE_DISABLE_BOTH]
        ])
        ,
        new TCLCommands('connectGFX9000', [
            ['true', OpenMSXLaunchService.ENABLE_GFX9000_CMD]
        ])
    ];

    private static readonly LAUNCH_ERROR_SPLIT_MSG_UNCAUGHT = 'Uncaught exception: ';
    private static readonly LAUNCH_ERROR_SPLIT_MSG_ERROR_IN = 'Error in ';

    constructor(private win: BrowserWindow, private settingsService: SettingsService, private eventLogService: EventLogService,
        private hashService: HashService, private errorLogService: ErrorLogService, private connectionManager: OpenMSXConnectionManager) {
        this.init();
    }

    private init() {
        ipcMain.on('launchGame', (event, game: Game, time: number, state: string) => {
            this.launch(game, time, state);
        });
        ipcMain.on('quickLaunch', (event, quickLaunchData: QuickLaunchData, time: number) => {
            this.quickLaunch(quickLaunchData, time);
        });
    }

    private launch(game: Game, time: number, state: string = null) {
        const args: string[] = [];
        this.setArguments(args, game, state);
        const process = this.startOpenmsx(args, time);

        this.win.webContents.send('launchGameProcessIdResponse' + game.sha1Code, process.pid);
        this.eventLogService.logEvent(new Event(EventSource.openMSX, EventType.LAUNCH, GameUtils.getMonikor(game)));
    }

    private async quickLaunch(quickLaunchData: QuickLaunchData, time: number) {
        const args: string[] = [];
        let filename: string;
        if (fs.existsSync(quickLaunchData.file)) {
            if (fs.statSync(quickLaunchData.file).isFile()) {
                const sha1 = await this.hashService.getSha1Code(quickLaunchData.file);
                this.setQuickLaunchFileArguments(args, quickLaunchData, sha1.filename, sha1.size);
                filename = path.basename(quickLaunchData.file);
            } else {
                this.setQuickLaunchDirectoryAsDisk(args, quickLaunchData);
                filename = path.basename(quickLaunchData.file) + '/';
            }    
        }
        this.setQuickLaunchOtherArguments(args, quickLaunchData);
        const process = this.startOpenmsx(args, time);

        this.win.webContents.send('quickLaunchProcessIdResponse' + time, process.pid, filename);
    }

    private startOpenmsx(args: string[], time: number): cp.ChildProcessWithoutNullStreams {
        const self = this;
        const options = {
            cwd: this.settingsService.getSettings().openmsxPath,
            detached: true
        };
        let errorMessage: string;

        const process = cp.spawn(PlatformUtils.getOpenmsxBinary(), args, options);
        process.on("error", (error) => {
            console.log(error.message);
            let errorMessage: string;
            const splitText = self.getSplitText(error);
            if (splitText) {
                errorMessage = error.message.substring(error.message.indexOf(splitText) + splitText.length);
            } else {
                errorMessage = 'Error launching openMSX';
            }
        });

        process.stderr.setEncoding('utf8');
        process.stderr.on('data', (data) => {
            errorMessage = data.toString();
        });

        process.on("close", (error: number) => {
            if (error) {
                this.errorLogService.logError('openMSX:', errorMessage);
            }
            this.connectionManager.disconnect(process.pid);
            self.win.webContents.send('launchGameResponse' + time, error === 1 ? errorMessage : null);
        });

        return process;
    }

    private getSplitText(error: cp.ExecException): string {
        if (error.message.indexOf(OpenMSXLaunchService.LAUNCH_ERROR_SPLIT_MSG_UNCAUGHT) > 0) {
            return OpenMSXLaunchService.LAUNCH_ERROR_SPLIT_MSG_UNCAUGHT;
        } else if (error.message.indexOf(OpenMSXLaunchService.LAUNCH_ERROR_SPLIT_MSG_ERROR_IN) > 0) {
            return OpenMSXLaunchService.LAUNCH_ERROR_SPLIT_MSG_ERROR_IN;
        } else {
            return null;
        }
    }

    private setArguments(args: string[], game: Game, state: string) {
        if (state) {
            args.push('-savestate');
            args.push(state);
        } else {
            OpenMSXLaunchService.fieldsToArgs.forEach (field => {
                if (game[field[0]]) {
                    args.push('-' + field[1]);
                    args.push(game[field[0]]);
                }
            });
            this.addTclCommandArguments(args, game);    
        }
    }

    private setQuickLaunchFileArguments(args: string[], quickLaunchData: QuickLaunchData, filename: string, size: number) {
        if (FileTypeUtils.isMSXFile(quickLaunchData.file)) {
            if (FileTypeUtils.isROM(filename)) {
                args.push('-carta');
            } else if (FileTypeUtils.isDisk(filename)) {
                if (size <= FileTypeUtils.MAX_DISK_FILE_SIZE) {
                    args.push('-diska');
                } else {
                    args.push('-hda');
                }
            } else if (FileTypeUtils.isTape(filename)) {
                args.push('-cassetteplayer');
            } else if (FileTypeUtils.isLaserdisc(filename)) {
                args.push('-laserdisc');
            }
            args.push(quickLaunchData.file);
        }
    }

    private setQuickLaunchDirectoryAsDisk(args: string[], quickLaunchData: QuickLaunchData) {
        args.push('-diska');
        args.push(quickLaunchData.file);
    }

    private setQuickLaunchOtherArguments(args: string[], quickLaunchData: QuickLaunchData) {
        args.push('-machine');
        args.push(quickLaunchData.machine);

        if (quickLaunchData.connectGFX9000) {
            args.push('-command');
            args.push(OpenMSXLaunchService.ENABLE_GFX9000_CMD);    
        }

        this.appendParams(args, quickLaunchData.parameters);
    }

    private appendParams(args: string[], argsString: string) {
        if (argsString) {
            const params = argsString.split('-');
            params.forEach((param) => {
                const space = param.indexOf(' ');
                if (space > -1) {
                    args.push('-' + param.substring(0, space));
                    args.push(param.substring(space + 1).trimEnd().replace(/"/g,''));
                }
            });
        }
    }

    private addTclCommandArguments(args: string[], game: Game) {
        let commandLineArgs: string[] = [];
        for (let item of OpenMSXLaunchService.tclCommandArgs) {
            if (game[item.field]) {
                for (let command of item.argCommands) {
                    if (game[item.field].toString() == command[0]) {
                        commandLineArgs.push(command[1]);
                    }
                }
            }
        }
        if (commandLineArgs.length > 0) {
            args.push('-command');
            args.push(commandLineArgs.join(';'));
        }
    }
}
