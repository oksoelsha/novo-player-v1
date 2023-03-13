import { BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { SettingsService } from './SettingsService';
import { GameSecondaryData } from '../src/app/models/secondary-data';
import * as cp from 'child_process'
import { PlatformUtils } from './utils/PlatformUtils';
import * as chokidar from 'chokidar';
import { GameSavedState } from '../src/app/models/saved-state';

export class FilesService {

    private readonly imageDataPrefix = 'data:image/png;base64,';

    private readonly cachedMusicFiles = new Map<number, string[]>();
    private cachedGameMusicPath: string;
    private readonly openmsxDataScrrenshotsFolder = path.join(PlatformUtils.getOpenmsxDataFolder(), 'screenshots');
    private cachedMoreScreenshots: string[] = [];
    private readonly openmsxSavedStatesFolder = path.join(PlatformUtils.getOpenmsxDataFolder(), 'savestates');

    constructor(private win: BrowserWindow, private settingsService: SettingsService) {
        this.init();
    }

    private init() {
        ipcMain.on('useFileSystemDialog', (event, options) => {
            this.openFileSystemDialog(options);
        });

        ipcMain.on('getSecondaryData', (event, sha1Code, genMsxId, suffix) => {
            const secondaryData = this.getSecondaryData(genMsxId, suffix, sha1Code);
            this.win.webContents.send('getSecondaryDataResponse' + sha1Code, secondaryData);
        });

        ipcMain.on('openFileExplorer', (event, file: string) => {
            this.openFileExplorer(file);
        });

        ipcMain.on('openOpenMSXScreenshotFile', (event, imagefile: string) => {
            this.openFileExplorerForOpenMSXScreenshot(imagefile);
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

        ipcMain.on('getGameSavedStates', (event, sha1Code: string) => {
            const savedStates = this.getSavedStates(sha1Code);
            this.win.webContents.send('getGameSavedStatesResponse' + sha1Code, savedStates);
        });

        ipcMain.on('deleteGameSavedState', (event, state: GameSavedState) => {
            const deleted = this.deleteSavedState(state);
            this.win.webContents.send('deleteGameSavedStateResponse', deleted);
        });

        chokidar.watch(this.openmsxDataScrrenshotsFolder, {
            ignoreInitial: true,
            followSymlinks: false
        }).on('all', (event: any, changedFile: string) => {
            this.cachedMoreScreenshots = [];
        });
    }

    private openFileSystemDialog(options: object) {
        dialog.showOpenDialog(this.win, options).then((value) => {
            this.win.webContents.send('useFileSystemDialogResponse', value);
        });
    }

    private getSecondaryData(genMsxId: number, suffix: string, sha1Code: string): GameSecondaryData {
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

        const musicFiles = this.getMusicFiles(genMsxId);
        let moreScreenshots = this.getMoreScreenshots(genMsxId, sha1Code);
        if (PlatformUtils.isWindows()) {
            // Front end appends 'unsafe' to the image file path if it encounters Windows drive name
            // so we replace the backslashes and remove the drive name
            moreScreenshots = moreScreenshots.map(m => m.replace(/\\/g, '/').substring(2));
        }

        return new GameSecondaryData(data1, data2, musicFiles, moreScreenshots);
    }

    private getMusicFiles(genMsxId: number): string[] {
        const gameMusicPath = this.settingsService.getSettings().gameMusicPath;
        if (gameMusicPath && !this.cachedGameMusicPath) {
            this.cachedGameMusicPath = gameMusicPath;
        } else if (gameMusicPath && this.cachedGameMusicPath && gameMusicPath !== this.cachedGameMusicPath) {
            this.cachedMusicFiles.clear();
            this.cachedGameMusicPath = gameMusicPath;
        }
        const cachedMusicFiles = this.cachedMusicFiles.get(genMsxId);
        if (cachedMusicFiles != null) {
            return cachedMusicFiles;
        } else if (genMsxId && gameMusicPath) {
            const folder = path.join(gameMusicPath, genMsxId.toString());
            if (fs.existsSync(folder)) {
                const list: string[] = [];
                const contents = fs.readdirSync(folder, 'utf8');
                contents.forEach(file => {
                    list.push(path.join(folder, file));
                });
                list.sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
                this.cachedMusicFiles.set(genMsxId, list);
                return list;
            } else {
                return [];
            }
        } else {
            return [];
        }
    }

    private getMoreScreenshots(genMsxId: number, sha1Code: string): string[] {
        let identifier: string;
        if (genMsxId) {
            identifier = genMsxId.toString();
        } else {
            identifier = sha1Code;
        }
        if (this.cachedMoreScreenshots.length > 0 || fs.existsSync(this.openmsxDataScrrenshotsFolder)) {
            const list: string[] = [];
            let folderContents: string[];
            if (this.cachedMoreScreenshots.length > 0) {
                folderContents = this.cachedMoreScreenshots;
            } else {
                folderContents = fs.readdirSync(this.openmsxDataScrrenshotsFolder, 'utf8');
                this.cachedMoreScreenshots = folderContents;
            }
            folderContents.filter(f => f.startsWith(identifier + '-'))
                .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .forEach(f => list.push(path.join(this.openmsxDataScrrenshotsFolder, f)));
            return list;
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

    private openFileExplorerForOpenMSXScreenshot(imagefile: string) {
        // we need to do additional processing for Windows: the drive name was removed when
        // the screenshot file was returned to the renderer process. Here we're putting it back
        let file: string;
        if (PlatformUtils.isWindows()) {
            const folder = path.join(PlatformUtils.getOpenmsxDataFolder(), 'screenshots');
            const filename = path.basename(imagefile);
            file = path.join(folder, filename);
        } else {
            file = imagefile;
        }
        this.openFileExplorer(file);
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

    private getSavedStates(sha1Code: string): GameSavedState[] {
        if (fs.existsSync(this.openmsxDataScrrenshotsFolder)) {
            const list: GameSavedState[] = [];
            const folderContents = fs.readdirSync(this.openmsxSavedStatesFolder, 'utf8');
            folderContents.forEach(f => {
                if (f.startsWith(sha1Code) && f.endsWith('.oms')) {
                    const state = this.sanitizePath(path.join(this.openmsxSavedStatesFolder, f));
                    const screenshot = this.sanitizePath(path.join(this.openmsxSavedStatesFolder, f.substring(0, f.length - 3) + 'png'));
                    list.push(new GameSavedState(state, screenshot));
                }
            });
            return list.sort((a: GameSavedState, b: GameSavedState) => a.state.localeCompare(b.state));
        } else {
            return [];
        }
    }

    private deleteSavedState(state: GameSavedState): boolean {
        let deleted: boolean;
        try {
            fs.unlinkSync(state.state);
            fs.unlinkSync(state.screenshot);
            deleted = true;
        } catch (er) {
            deleted = false;
        }
        return deleted;
    }

    private sanitizePath(filename: string): string {
        if (PlatformUtils.isWindows()) {
            // Front end appends 'unsafe' to the image file path if it encounters Windows drive name
            // so we replace the backslashes and remove the drive name
            return filename.replace(/\\/g, '/').substring(2);
        } else {
            return filename;
        }
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
