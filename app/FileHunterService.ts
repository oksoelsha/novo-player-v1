import { BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { FileTypeUtils } from './utils/FileTypeUtils';
import { PersistenceUtils } from './utils/PersistenceUtils';
import { UpdateListerner } from './UpdateListerner';
import { SettingsService } from './SettingsService';
import { EnvironmentService } from './EnvironmentService';

class FileNode {
    isFolder: boolean;
    children: Map<string, FileNode>;

    constructor(isFolder: boolean) {
        this.isFolder = isFolder;
        if (isFolder) {
            this.children = new Map();
        }
    }
}

export class FileHunterService implements UpdateListerner {

    private allFilesPath = path.join(PersistenceUtils.getFileHunterFilesStoragePath(), 'allfiles.txt');
    private readonly gamesRoot = 'Games\\';
    private readonly includedFolders = new Set<string>();
    private games = new Map<string, FileNode>();
    private cachedFolder: string;
    private cachedContents: any;

    constructor(private win: BrowserWindow, private settingsService: SettingsService, private environmentService: EnvironmentService) {
        settingsService.addListerner(this);
        if(settingsService.getSettings().enableFileHunterGames) {
            this.init();
        }
    }

    reinit(): void {
        if (this.settingsService.getSettings().enableFileHunterGames) {
            if (this.includedFolders.size === 0) {
                this.init();
            }
        } else {
            this.includedFolders.clear();
            this.games.clear();
            this.cachedFolder = null;
            this.cachedContents = null;
        }
    }

    private init(): void {
        this.moveFileHunterFileIfNecessary();
        this.initIncludedFolders();
        this.initGamesList();

        ipcMain.on('getFileHunterList', (event, folder: string, pageSize: number, page: number, filter: string) => {
            this.getList(folder, pageSize, page, filter);
        });
        ipcMain.on('getFileHunterGameLink', (event, filename: string) => this.getGameLink(filename));
    }

    private initIncludedFolders() {
        this.includedFolders.add('\\Arabic');
        this.includedFolders.add('\\ColecoVision');
        this.includedFolders.add('\\Korean');
        this.includedFolders.add('\\Korean\\Aproman');
        this.includedFolders.add('\\Korean\\Boram Soft');
        this.includedFolders.add('\\Korean\\Clover Soft');
        this.includedFolders.add('\\Korean\\Daewoo');
        this.includedFolders.add('\\Korean\\Daou Infosys');
        this.includedFolders.add('\\Korean\\FA Soft');
        this.includedFolders.add('\\Korean\\Gabo system');
        this.includedFolders.add('\\Korean\\Open');
        this.includedFolders.add('\\Korean\\Prosoft');
        this.includedFolders.add('\\Korean\\Qnix Corporation');
        this.includedFolders.add('\\Korean\\Saeron');
        this.includedFolders.add('\\Korean\\Sammi');
        this.includedFolders.add('\\Korean\\San Ho');
        this.includedFolders.add('\\Korean\\Screen Software');
        this.includedFolders.add('\\Korean\\SIECO');
        this.includedFolders.add('\\Korean\\Topia');
        this.includedFolders.add('\\Korean\\Unknown Publisher');
        this.includedFolders.add('\\Korean\\Uttum Soft');
        this.includedFolders.add('\\Korean\\Zemina - Saehan Sangsa');
        this.includedFolders.add('\\MSX Turbo-R');
        this.includedFolders.add('\\MSX Turbo-R\\DSK');
        this.includedFolders.add('\\MSX Turbo-R\\Harddisk');
        this.includedFolders.add('\\MSX Turbo-R\\ROM');
        this.includedFolders.add('\\MSX1');
        this.includedFolders.add('\\MSX1\\CAS');
        this.includedFolders.add('\\MSX1\\DSK');
        this.includedFolders.add('\\MSX1\\HDD');
        this.includedFolders.add('\\MSX1\\ROM');
        this.includedFolders.add('\\MSX1\\WAV');
        this.includedFolders.add('\\MSX2');
        this.includedFolders.add('\\MSX2\\CAS');
        this.includedFolders.add('\\MSX2\\DSK');
        this.includedFolders.add('\\MSX2\\Harddisk');
        this.includedFolders.add('\\MSX2\\ROM');
        this.includedFolders.add('\\MSX2+');
        this.includedFolders.add('\\MSX2+\\DSK');
        this.includedFolders.add('\\MSX2+\\ROM');
    }

    private moveFileHunterFileIfNecessary() {
        if (!fs.existsSync(this.allFilesPath) || this.environmentService.isNeedToUpdateApplicationData()) {
            fs.mkdirSync(PersistenceUtils.getFileHunterFilesStoragePath(), { recursive: true });
            fs.copyFileSync(path.join(__dirname, 'extra/file-hunter-allfiles.txt'), this.allFilesPath);
        }
    }

    private initGamesList() {
        const data = fs.readFileSync(this.allFilesPath, { encoding: 'ascii' });
        const lines = data.split(/\r?\n/);

        lines.forEach((line) => {
            if (line?.startsWith(this.gamesRoot)) {
                const parts = line.split('\\');
                let current = this.games;
                let folderName = '';
                for (let index = 1; index < parts.length; index++) {
                    const part = parts[index];
                    const isFile = index === parts.length - 1;
                    folderName += '\\' + part;
                    if (this.includedFolders.has(folderName) || isFile) {
                        if (!isFile || FileTypeUtils.isMSXFile(part)) {
                            if (!current.get(part)) {
                                current.set(part, new FileNode(!isFile));
                            }
                            current = current.get(part).children;
                        }
                    } else {
                        break;
                    }
                }
            }
        });
    }

    private getList(folder: string, pageSize: number, page: number, filter: string) {
        let contents: any[];
        if (folder === this.cachedFolder && this.cachedContents) {
            contents = this.cachedContents;
            if (filter) {
                contents = contents.filter((f: any) => f.name.toLowerCase().includes(filter.toLowerCase()));
            }
        } else {
            let map = this.games;
            let parts: string[];
            if (folder) {
                parts = folder.split('\\');
            } else {
                parts = [];
            }

            for (let index = 0; index < parts.length; index++) {
                if (parts[index] !== '') {
                    map = map.get(parts[index]).children;
                }
            }

            const files: any[] = [];
            const folders: any[] = [];
            // reason for separating files and folders and combining them later is that they appear in flipped order
            // in file-hunter's allfiles list
            map.forEach((value, key) => {
                if (value.isFolder) {
                    folders.push({ name: key, isFolder: value.isFolder, parent: folder });
                } else {
                    files.push({ name: key, isFolder: value.isFolder, parent: folder });
                }
            });
            contents = folders.concat(files);
            this.cachedFolder = folder;
            this.cachedContents = contents;
        }

        const startIndex = page * pageSize;
        const pagedContents = contents.slice(startIndex, startIndex + pageSize);
        const currentFullPath = (this.gamesRoot + folder.substring(1)).replace(/\\/g, '/');

        this.win.webContents.send('getFileHunterListResponse', { contents: pagedContents, total: contents.length, path: currentFullPath });
    }

    private getGameLink(filename: string) {
        const adjustedFilename = filename.replace(/\\/g, '/');
        this.win.webContents.send('getFileHunterGameLinkResponse', 'https://download.file-hunter.com/Games' + adjustedFilename);
    }
}
