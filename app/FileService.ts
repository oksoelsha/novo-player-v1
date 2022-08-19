import { BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { SettingsService } from './SettingsService';
import { GameSecondaryData } from '../src/app/models/secondary-data';
import * as cp from 'child_process'
import { PlatformUtils } from './utils/PlatformUtils';

export class FilesService {

    private imageDataPrefix: string = 'data:image/png;base64,';

    constructor(private win: BrowserWindow, private settingsService: SettingsService) {
        this.init();
    }

    private init() {
        ipcMain.on('useFileSystemDialog', (event, options) => {
            this.openFileSystemDialog(options);
        });

        ipcMain.on('getSecondaryData', (event, sha1Code, genMsxId, suffix) => {
            const secondaryData = this.getSecondaryData(genMsxId, suffix);
            this.win.webContents.send('getSecondaryDataResponse' + sha1Code, secondaryData);
        });

        ipcMain.on('openFileExplorer', (event, file: string) => {
            this.openFileExplorer(file);
        });

        ipcMain.on('openExternally', (event, path: string) => {
            this.openExternally(path);
        });

        ipcMain.on('getWebMSXPath', (event, folder: string, file: string) => {
            const fullpath = path.join(folder, file);
            if (fs.existsSync(fullpath)) {
                this.win.webContents.send('getWebMSXPathResponse', fullpath);
            } else {
                this.win.webContents.send('getWebMSXPathResponse', null);
            }
        });

        ipcMain.on('getScreenshotsVersion', (event) => {
            const screenshotVersion = this.getScreenshotVersion();
            this.win.webContents.send('getScreenshotsVersionResponse', screenshotVersion);
        });

        ipcMain.on('getGameMusicVersion', (event) => {
            const gameMusicVersion = this.getGameMusicVersion();
            this.win.webContents.send('getGameMusicVersionResponse', gameMusicVersion);
        });

        ipcMain.on('getFileGroup', (event, pid: number, filename: string) => {
            const fileGroup = this.getFileGroup(filename);
            this.win.webContents.send('getFileGroupResponse' + pid, fileGroup);
        });
    }

    private openFileSystemDialog(options: object) {
        dialog.showOpenDialog(this.win, options).then((value) => {
            this.win.webContents.send('useFileSystemDialogResponse', value);
        });
    }

    private getSecondaryData(genMsxId: number, suffix: string): GameSecondaryData {
        let screenshotsPath1: string;
        if (suffix == null) {
            screenshotsPath1 = path.join(this.settingsService.getSettings().screenshotsPath, genMsxId + 'a.png');
        } else {
            screenshotsPath1 = path.join(this.settingsService.getSettings().screenshotsPath, genMsxId + 'a' + suffix + '.png');
        }

        let data1: string;
        try {
            data1 = this.imageDataPrefix + fs.readFileSync(screenshotsPath1).toString('base64');
        } catch (err) {
            data1 = '';
        }

        let data2: string;
        if (data1) {
            var screenshotsPath2: string;
            if (suffix == null) {
                screenshotsPath2 = path.join(this.settingsService.getSettings().screenshotsPath, genMsxId + 'b.png');
            } else {
                screenshotsPath2 = path.join(this.settingsService.getSettings().screenshotsPath, genMsxId + 'b' + suffix + '.png');
            }
            try {
                data2 = this.imageDataPrefix + fs.readFileSync(screenshotsPath2).toString('base64');
            } catch (err) {
                data2 = '';
            }
        } else {
            data2 = '';
        }

        let musicFiles: string[] = this.getMusicFiles(genMsxId);

        return new GameSecondaryData(data1, data2, musicFiles);
    }

    private getMusicFiles(genMsxId: number): string[] {
        if (genMsxId && this.settingsService.getSettings().gameMusicPath) {
            let folder = path.join(this.settingsService.getSettings().gameMusicPath, genMsxId.toString());
            if (fs.existsSync(folder)) {
                const list: string[] = [];
                const contents = fs.readdirSync(folder, 'utf8');
                contents.forEach(file => {
                    list.push(path.join(folder, file));
                });
                list.sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
                return list;
            } else {
                return [];
            }
        } else {
            return [];
        }
    }

    private openFileExplorer(file: string) {
        const fileManagerCommand = PlatformUtils.getFileManagerCommand(file);
        const ls = cp.exec(fileManagerCommand, function (error: cp.ExecException, stdout, stderr) {
            if (error) {
            }
        });
    }

    private openExternally(path: string) {
        shell.openPath(path);
    }

    private getScreenshotVersion(): string {
        return this.getVersionValue(this.settingsService.getSettings().screenshotsPath, 'version.txt');
    }

    private getGameMusicVersion(): string {
        return this.getVersionValue(this.settingsService.getSettings().gameMusicPath, 'version.txt');
    }

    private getVersionValue(filepath: string, filename: string) :string {
        if (filepath) {
            let versionFile = path.join(filepath, filename);
            if (fs.existsSync(versionFile)) {
                return fs.readFileSync(versionFile).toString();
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private getFileGroup(filename: string): string[] {
        const diskPatternIndexParenthesisVariant1 = filename.lastIndexOf('(Disk ');
        const diskPatternIndexParenthesisVariant2 = filename.lastIndexOf('(Disk');
        const diskPatternIndexSquare = filename.lastIndexOf('[Disk ');
        const tapePatternIndex = filename.lastIndexOf('(Side ');
        let counterIndex: number;

        if (diskPatternIndexParenthesisVariant1 > 0 && filename.lastIndexOf(' of ') == (diskPatternIndexParenthesisVariant1 + 7)) {
            counterIndex = diskPatternIndexParenthesisVariant1 + 6;
        } else if (diskPatternIndexParenthesisVariant2 > 0 && filename.lastIndexOf('of') == (diskPatternIndexParenthesisVariant2 + 6)) {
            counterIndex = diskPatternIndexParenthesisVariant2 + 5;
        } else if (diskPatternIndexSquare > 0 && filename.lastIndexOf(' of ') == (diskPatternIndexSquare + 7)) {
            counterIndex = diskPatternIndexSquare + 6;
        } else if (tapePatternIndex > 0 && filename.lastIndexOf(')', tapePatternIndex) == (tapePatternIndex + 7)) {
            counterIndex = tapePatternIndex + 6;
        } else {
            counterIndex = filename.lastIndexOf('.') - 1;
        }

        return this.examineFileFormat(filename, counterIndex);
    }

    private examineFileFormat(filename: string, counterIndex: number): string[] {
        const counterCharacter = filename.charAt(counterIndex);
        let potentialMatches: string[] = [];
        const currentDirectory = path.dirname(filename);
        const files = fs.readdirSync(currentDirectory, 'utf8');
        files.forEach(file => {
            const fullPath: string = path.join(currentDirectory, file);
            if (fullPath.substring(0, counterIndex - 1) == filename.substring(0, counterIndex - 1) &&
                fullPath.substring(counterIndex + 1) == filename.substring(counterIndex + 1)) {
                potentialMatches.push(fullPath);
            }
        });
        potentialMatches = potentialMatches.sort();
        const matches: string[] = [];
        let done = false;
        let index = 0;
        let fileCounter = counterCharacter;
        for (index; index < potentialMatches.length && !done; index++) {
            if (fileCounter == potentialMatches[index].charAt(counterIndex)) {
                matches.push(potentialMatches[index]);
                fileCounter = String.fromCharCode((fileCounter.charCodeAt(0) + 1));
            } else {
                done = true;
            }
        }
        return matches;
    }
}
