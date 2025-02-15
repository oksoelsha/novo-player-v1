import * as cp from 'child_process'
import * as fs from 'fs';
import * as path from 'path';
import { BrowserWindow, ipcMain } from 'electron'
import { EventLogService } from './EventLogService'
import { SettingsService } from './SettingsService'
import { Event, EventSource, EventType } from '../src/app/models/event'
import { Game } from '../src/app/models/game'
import { PlatformUtils } from './utils/PlatformUtils'
import { QuickLaunchData } from '../src/app/models/quick-launch-data'
import { HashService } from './HashService'
import { FileTypeUtils } from './utils/FileTypeUtils';
import { ErrorLogService } from './ErrorLogService';
import { OpenMSXConnectionManager } from './OpenMSXConnectionManager';
import { GameUtils } from './utils/GameUtils';
import { EmulatorUtils } from './utils/EmulatorUtils';

class TCLCommands {
    field: string;
    argCommands: string[][];

    constructor(field: string, argCommands: string[][]) {
        this.field = field;
        this.argCommands = argCommands;
    }
}

export class OpenMSXLaunchService {

    private static readonly ARGS_SEPARATOR = '-';
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

    private static readonly Input_Device_JOYTAP = 'plug joyporta joytap';
    private static readonly Input_Device_JOYSTICK_KEYBOARD = 'plug joyporta keyjoystick1';
    private static readonly Input_Device_MOUSE = 'plug joyporta mouse';
    private static readonly Input_Device_ARKANOID_PAD = 'plug joyporta arkanoidpad';
    private static readonly Input_Device_TRACKBALL = 'plug joyportb trackball';
    private static readonly Input_Device_TOUCHPAD = 'plug joyportb touchpad';
    private static readonly Input_Device_MAGICKEY = 'plug joyportb magic-key';
    private static readonly Input_Device_NINJATAP = 'plug joyporta ninjatap';
    private static readonly Input_Device_TETRIS2PROTECTION = 'plug joyportb tetris2-protection';
    private static readonly Input_Device_PADDLE = 'plug joyporta paddle';
    private static readonly Input_Device_MSX_JOYSTICK1 = 'plug joyporta msxjoystick1';
    private static readonly Input_Device_MSX_JOYSTICK2 = 'plug joyportb msxjoystick2';
    private static readonly Input_Device_JOYMEGA1 = 'plug joyporta joymega1';
    private static readonly Input_Device_JOYMEGA2 = 'plug joyportb joymega2';
    private static readonly Input_Device_CIRCUIT_DESIGNER_RD_DONGLE = 'plug joyportb circuit-designer-rd-dongle';

    private static readonly FDD_MODE_DISABLE_SECOND = 'after boot { keymatrixdown 6 2; after time 14 \"keymatrixup 6 2\" }';
    private static readonly FDD_MODE_DISABLE_BOTH = 'after boot { keymatrixdown 6 1; after time 14 \"keymatrixup 6 1\" }';

    private static readonly tclCommandArgs: TCLCommands[] = [
        new TCLCommands('inputDevice', [
            ['1', OpenMSXLaunchService.Input_Device_JOYTAP],
            ['2', OpenMSXLaunchService.Input_Device_JOYSTICK_KEYBOARD],
            ['3', OpenMSXLaunchService.Input_Device_MOUSE],
            ['4', OpenMSXLaunchService.Input_Device_ARKANOID_PAD],
            ['5', OpenMSXLaunchService.Input_Device_TRACKBALL],
            ['6', OpenMSXLaunchService.Input_Device_TOUCHPAD],
            ['7', OpenMSXLaunchService.Input_Device_MAGICKEY],
            ['8', OpenMSXLaunchService.Input_Device_NINJATAP],
            ['9', OpenMSXLaunchService.Input_Device_TETRIS2PROTECTION],
            ['10', OpenMSXLaunchService.Input_Device_PADDLE],
            ['11', OpenMSXLaunchService.Input_Device_MSX_JOYSTICK1],
            ['12', OpenMSXLaunchService.Input_Device_MSX_JOYSTICK2],
            ['13', OpenMSXLaunchService.Input_Device_JOYMEGA1],
            ['14', OpenMSXLaunchService.Input_Device_JOYMEGA2],
            ['15', OpenMSXLaunchService.Input_Device_CIRCUIT_DESIGNER_RD_DONGLE]
        ])
        ,
        new TCLCommands('fddMode', [
            ['1', OpenMSXLaunchService.FDD_MODE_DISABLE_SECOND],
            ['2', OpenMSXLaunchService.FDD_MODE_DISABLE_BOTH]
        ])
    ];

    private static readonly LAUNCH_ERROR_SPLIT_MSG_UNCAUGHT = 'Uncaught exception: ';
    private static readonly LAUNCH_ERROR_SPLIT_MSG_ERROR_IN = 'Error in ';
    private enableGFX9000Script = path.join(__dirname, 'scripts/enable_gfx9000.tcl');
    private soundDetectorScript = path.join(__dirname, 'scripts/detect_sound_chips.tcl');

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
                if (sha1) {
                    this.setQuickLaunchFileArguments(args, quickLaunchData, sha1.filename, sha1.size);
                    filename = path.basename(quickLaunchData.file);                        
                }
            } else {
                this.setQuickLaunchDirectoryAsDisk(args, quickLaunchData);
                filename = path.basename(quickLaunchData.file) + '/';
            }    
        }
        this.setQuickLaunchOtherArguments(args, quickLaunchData);
        this.addArgument(args, 'script', this.soundDetectorScript);

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

        // give process id socket file enough time to be written
        setTimeout(() => {
            this.connectionManager.executeCommand(process.pid, 'openmsx_update enable setting');
        }, 4000);

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
            this.addArgument(args, 'savestate', state);
        } else {
            OpenMSXLaunchService.fieldsToArgs.forEach (field => {
                if (game[field[0]]) {
                    this.addArgument(args, field[1], game[field[0]]);
                }
            });
            this.addTclCommandArguments(args, game);
            if (game.connectGFX9000) {
                this.addArgument(args, 'script', this.enableGFX9000Script);
            }
        }
        this.addArgument(args, 'script', this.soundDetectorScript);
    }

    private setQuickLaunchFileArguments(args: string[], quickLaunchData: QuickLaunchData, filename: string, size: number) {
        if (FileTypeUtils.isMSXFile(quickLaunchData.file)) {
            if (FileTypeUtils.isROM(filename)) {
                this.addArgument(args, 'carta', quickLaunchData.file);
            } else if (FileTypeUtils.isDisk(filename)) {
                if (size <= FileTypeUtils.MAX_DISK_FILE_SIZE) {
                    this.addArgument(args, 'diska', quickLaunchData.file);
                } else {
                    this.addArgument(args, 'hda', quickLaunchData.file);
                }
            } else if (FileTypeUtils.isTape(filename)) {
                this.addArgument(args, 'cassetteplayer', quickLaunchData.file);
            } else if (FileTypeUtils.isLaserdisc(filename)) {
                this.addArgument(args, 'laserdisc', quickLaunchData.file);
            } else if (FileTypeUtils.isZip(filename)) {
                args.push(quickLaunchData.file);
            }
        }
    }

    private setQuickLaunchDirectoryAsDisk(args: string[], quickLaunchData: QuickLaunchData) {
        this.addArgument(args, 'diska', quickLaunchData.file);
    }

    private setQuickLaunchOtherArguments(args: string[], quickLaunchData: QuickLaunchData) {
        this.addArgument(args, 'machine', quickLaunchData.machine);

        if (quickLaunchData.connectGFX9000) {
            this.addArgument(args, 'script', this.enableGFX9000Script);
        }

        EmulatorUtils.appendParams(args, quickLaunchData.parameters, OpenMSXLaunchService.ARGS_SEPARATOR);
    }

    private addTclCommandArguments(args: string[], game: Game) {
        let commandLineArgs: string[] = [];
        for (const item of OpenMSXLaunchService.tclCommandArgs) {
            if (game[item.field]) {
                for (const command of item.argCommands) {
                    if (game[item.field].toString() == command[0]) {
                        commandLineArgs.push(command[1]);
                    }
                }
            }
        }
        if (commandLineArgs.length > 0) {
            this.addArgument(args, 'command', commandLineArgs.join(';'));
        }
    }

    private addArgument(args: string[], argument: string, value: string) {
        args.push('-' + argument);
        args.push(value);
    }
}
