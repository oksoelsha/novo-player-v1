import * as cp from 'child_process';
import * as chokidar from 'chokidar';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Game } from '../src/app/models/game';
import { Medium } from '../src/app/models/medium';
import { GameSavedState } from '../src/app/models/saved-state';
import { GameSecondaryData } from '../src/app/models/secondary-data';
import { SettingsService } from './SettingsService';
import { PlatformUtils } from './utils/PlatformUtils';

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

        ipcMain.on('getSecondaryData', (event, game: Game) => {
            const secondaryData = this.getSecondaryData(game);
            this.win.webContents.send('getSecondaryDataResponse' + game.sha1Code, secondaryData);
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

        ipcMain.on('getColecoScreenshotsVersion', (event) => {
            const colecoScreenshotVersion = this.getColecoScreenshotVersion();
            this.win.webContents.send('getColecoScreenshotsVersionResponse', colecoScreenshotVersion);
        });

        ipcMain.on('getSpectravideoScreenshotsVersion', (event) => {
            const spectravideoScreenshotVersion = this.getSpectravideoScreenshotVersion();
            this.win.webContents.send('getSpectravideoScreenshotsVersionResponse', spectravideoScreenshotVersion);
        });

        ipcMain.on('getSegaScreenshotsVersion', (event) => {
            const segaScreenshotVersion = this.getSegaScreenshotVersion();
            this.win.webContents.send('getSegaScreenshotsVersionResponse', segaScreenshotVersion);
        });

        ipcMain.on('getFileGroup', (event, pid: number, medium: Medium, filename: string) => {
            if (fs.existsSync(filename)) {
                const fileGroup = this.getFileGroup(medium, filename);
                this.win.webContents.send('getFileGroupResponse' + pid, fileGroup);
            } else {
                this.win.webContents.send('getFileGroupResponse' + pid, []);
            }
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

    private getSecondaryData(game: Game): GameSecondaryData {
        let screenshotsData: any;
        if (game.colecoScreenshot) {
            screenshotsData = this.getOtherEmulatorsScreenshotsData(this.settingsService.getSettings().colecoScreenshotsPath,
                game.colecoScreenshot);
        } else if (game.spectravideoScreenshot) {
            screenshotsData = this.getOtherEmulatorsScreenshotsData(this.settingsService.getSettings().spectravideoScreenshotsPath,
                game.spectravideoScreenshot);
        } else if (game.segaScreenshot) {
            screenshotsData = this.getOtherEmulatorsScreenshotsData(this.settingsService.getSettings().segaScreenshotsPath,
                game.segaScreenshot);
        } else {
            // Now assume this is an MSX game
            screenshotsData = this.getMSXScreenshotsData(this.settingsService.getSettings().screenshotsPath, game.sha1Code,
                game.generationMSXId, game.screenshotSuffix);
        }

        const musicFiles = this.getMusicFiles(game.generationMSXId);
        let moreScreenshots = this.getMoreScreenshots(game.generationMSXId, game.sha1Code);
        if (PlatformUtils.isWindows()) {
            // Front end appends 'unsafe' to the image file path if it encounters Windows drive name
            // so we replace the backslashes and remove the drive name
            moreScreenshots = moreScreenshots.map(m => m.replace(/\\/g, '/').substring(2));
        }
        return new GameSecondaryData(screenshotsData.data1, screenshotsData.data2, musicFiles, moreScreenshots);
    }

    private getMSXScreenshotsData(screenshotsPath: string, screenshotFile: string, genMsxId: number, suffix: string): any {
        let screenshotPath1: string;
        let data1: string;
        let screenshotPath2: string;
        let data2: string;

        if (suffix == null) {
            screenshotPath1 = path.join(screenshotsPath, genMsxId + 'a.png');
        } else {
            screenshotPath1 = path.join(this.settingsService.getSettings().screenshotsPath, genMsxId + 'a' + suffix + '.png');
        }
        try {
            data1 = this.imageDataPrefix + fs.readFileSync(screenshotPath1).toString('base64');
        } catch (err) {
            // ignore
        }
        if (data1) {
            if (suffix == null) {
                screenshotPath2 = path.join(screenshotsPath, genMsxId + 'b.png');
            } else {
                screenshotPath2 = path.join(screenshotsPath, genMsxId + 'b' + suffix + '.png');
            }
            try {
                data2 = this.imageDataPrefix + fs.readFileSync(screenshotPath2).toString('base64');
            } catch (err) {
                // ignore
            }
        }
        return { data1, data2 };
    }

    private getOtherEmulatorsScreenshotsData(screenshotPath: string, screenshotFile: string): any {
        const screenshotsPath1 = path.join(screenshotPath, screenshotFile + '_a.png');
        let data1: string;
        let data2: string;
        try {
            data1 = this.imageDataPrefix + fs.readFileSync(screenshotsPath1).toString('base64');
        } catch (err) {
            // ignore
        }
        if (data1) {
            const screenshotsPath2 = path.join(screenshotPath, screenshotFile + '_b.png');                
            try {
                data2 = this.imageDataPrefix + fs.readFileSync(screenshotsPath2).toString('base64');
            } catch (err) {
                // ignore
            }
        }
        return { data1, data2 };
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
        const ls = cp.exec(fileManagerCommand, (error: cp.ExecException, stdout, stderr) => {
            if (error) {
            }
        });
    }

    private openFileExplorerForOpenMSXScreenshot(imagefile: string) {
        // we need to do additional processing for Windows: the drive name was removed when
        // the screenshot file was returned to the renderer process. Here we're putting it back
        let file: string;
        if (PlatformUtils.isWindows()) {
            const filename = path.basename(imagefile);
            file = path.join(this.openmsxDataScrrenshotsFolder, filename);
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

    private getColecoScreenshotVersion(): string {
        return this.getVersionValue(this.settingsService.getSettings().colecoScreenshotsPath, '_version.txt');
    }

    private getSpectravideoScreenshotVersion(): string {
        return this.getVersionValue(this.settingsService.getSettings().spectravideoScreenshotsPath, '_version.txt');
    }

    private getSegaScreenshotVersion(): string {
        return this.getVersionValue(this.settingsService.getSettings().segaScreenshotsPath, '_version.txt');
    }

    private getVersionValue(filepath: string, filename: string): string {
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

    private getFileGroup(medium: Medium, filename: string): string[] {
        const folder = path.dirname(filename);
        const fileOnly = path.basename(filename);

        // The last rule checks for the last character of the filename before the file extension.
        // Therefore, it will always match files that don't match the previous rules
        const fileExtensionIndex = fileOnly.lastIndexOf('.');
        let toMatchList: string[][] = [];
        if (medium === Medium.disk) {
            toMatchList = [
                ['(.*)', '\\([Dd]isk\\s*\\d+\\s*of\\s*\\d+\\)', ')', '(.*)'],
                ['(.*)', '\\[Disk\\s*\\d+\\s*of\\s*\\d+\\]', ']', '(.*)'],
                ['(.*)', '\\(Disk \\w\\)', ')', '(.*)'],
                [
                    this.escapeRegex(fileOnly.substring(0, fileExtensionIndex - 1)),
                    '\\w',
                    '',
                    fileOnly.substring(fileExtensionIndex)
                ]
            ];
        } else if (medium === Medium.tape) {
            toMatchList = [
                ['(.*)', '\\(Side \\w\\)', ')', '(.*)']
            ];            
        }

        for(const toMatch of toMatchList) {
            const matchedFiles = this.getMatchedFiles(folder, fileOnly, toMatch);
            if (matchedFiles) {
                return matchedFiles;
            }
        };

        // no matches
        return [];
    }

    private getMatchedFiles(folder: string, file: string, toMatch: string[]): string[] {
        const startMatch = toMatch[0];
        const middleMatch = toMatch[1];
        const closingChar = toMatch[2];
        const endMatch = toMatch[3];
        try {
            const pattern = new RegExp(startMatch + middleMatch + endMatch);
            const match = pattern.exec(file);
            if (match) {
                if (closingChar) {
                    const closingCharIndex = file.indexOf(closingChar, match[1].length);
                    const regex = this.escapeRegex(match[1]) +
                        middleMatch +
                        this.escapeRegex(file.substring(closingCharIndex + 1));
                    return this.getMatchedFilesOnDisk(folder, regex);
                } else {
                    // this is meant for the last match rule where there's no closing character
                    const regex = this.escapeRegex(startMatch) +
                        middleMatch +
                        this.escapeRegex(endMatch);
                    return this.getMatchedFilesOnDisk(folder, regex);
                }
            } else {
                return null;
            }
        } catch (error) {
            // this means the file name caused an regular expression syntax error. Just return no match
            return [];
        }
    }

    private escapeRegex(regex: string): string {
        return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private getMatchedFilesOnDisk(folder: string, regex: string): string[] {
        const files = fs.readdirSync(folder, 'utf8');
        const toMatch = new RegExp(regex);
        const sequenceFiles = files.filter(file => {
            const match = file.match(toMatch);
            return match !== null;
        });
        return sequenceFiles.map(file => path.join(folder, file));
    }

    private getSavedStates(sha1Code: string): GameSavedState[] {
        if (fs.existsSync(this.openmsxSavedStatesFolder)) {
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
}
