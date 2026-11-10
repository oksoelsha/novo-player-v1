import axios from 'axios';
import { BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { EnvironmentService } from './EnvironmentService';
import { SettingsService } from './SettingsService';
import { UpdateListerner } from './UpdateListerner';
import { FileTypeUtils } from './utils/FileTypeUtils';

class FileNode {
    isFolder: boolean;
    children: Map<string, FileNode> | undefined;

    constructor(isFolder: boolean) {
        this.isFolder = isFolder;
        if (isFolder) {
            this.children = new Map();
        }
    }
}

export class FileHunterService implements UpdateListerner {

    private allFilesPath = path.join(__dirname, 'data-files/file-hunter-allfiles.txt');
    private readonly gamesRoot = 'Games\\';
    private readonly gamesURL = 'https://download.file-hunter.com/Games';
    private readonly includedFolders = new Set<string>();
    private games = new Map<string, FileNode>();
    private cachedFolder: string | null = null;
    private cachedContents: any;
    private cachedNewAdditions = new ExpiringVariable(3 * 60 * 60 * 1000);  // 3 hours
    private lastNewAddition: String | null = null;

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
            this.cachedNewAdditions.clear();
        }
    }

    private init(): void {
        this.initIncludedFolders();
        this.initGamesList();

        ipcMain.on('getFileHunterList', (event, folder: string, pageSize: number, page: number, filter: string) => {
            this.getList(folder, pageSize, page, filter);
        });
        ipcMain.on('getFileHunterNewAdditions', (event, pageSize: number, page: number) => {
            this.getNewAdditions(pageSize, page);
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

    private initGamesList() {
        const data = fs.readFileSync(this.allFilesPath, { encoding: 'utf8' });
        const lines = data.split(/\r?\n/);

        lines.forEach((line) => {
            if (line?.startsWith(this.gamesRoot)) {
                const parts = line.split('\\');
                let current: Map<string, FileNode> | undefined = this.games;
                let folderName = '';
                for (let index = 1; index < parts.length; index++) {
                    const part = parts[index];
                    const isFile = index === parts.length - 1;
                    folderName += '\\' + part;
                    if (this.includedFolders.has(folderName) || isFile) {
                        if (!isFile || FileTypeUtils.isMSXFile(part)) {
                            if (current !== undefined && current.get(part) === undefined) {
                                current.set(part, new FileNode(!isFile));
                            }
                            current = current?.get(part)?.children;
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
                    map = map.get(parts[index])!.children!;
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

    private async getNewAdditions(pageSize: number, page: number) {
        let contents: any;
        let updated = false;
        let start: number;
        if (this.cachedNewAdditions.get()) {
            contents = this.cachedNewAdditions.get();
            start = page * pageSize;
        } else {
            let rawContents: string;
            try {
                rawContents = await this.retrieveNewAdditions();
            } catch(err: any) {
                this.win.webContents.send('getFileHunterNewAdditionsResponse', { error: true, errorMessage: err.message });
                return;
            }
            const lines = rawContents.split(/\r\n|\r|\n/);
            if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
                lines.pop();
            }
            if (lines.length > 0) {
                updated = this.lastNewAddition !== null && lines[0].trim() !== this.lastNewAddition;
                this.lastNewAddition = lines[0].trim();
            }
 
            const domainLength = this.gamesURL.length + 1;
            const convertedIncludedFolders = Array.from(this.includedFolders).map(f => f.replace(/\\/g, '/')).map(f => f.slice(1));
            contents = lines.map((item: string) => {
                const parts = item.trim().split(/\s+/);
                return { name: parts[2].substring(domainLength), date: parts[0] };
            }).filter((item: any) => convertedIncludedFolders.some(prefix => (item.name).startsWith(prefix)));
            this.cachedNewAdditions.set(contents);
            if (updated) {
                start = 0;
            } else {
                start = page * pageSize;                
            }
        }
        const pagedContents = contents.slice(start, start + pageSize);

        this.win.webContents.send('getFileHunterNewAdditionsResponse',
            { contents: pagedContents, total: contents.length, updated: updated });
    }

    private getGameLink(filename: string) {
        const adjustedFilename = filename.replace(/\\/g, '/');
        this.win.webContents.send('getFileHunterGameLinkResponse', this.gamesURL + adjustedFilename);
    }

    private async retrieveNewAdditions() {
        try {
            const url = 'https://download.file-hunter.com/update.php?days=30';
            const response = await axios.get(url);
            if (response.status !== 200) {
                throw new Error('Error reading File Hunter URL - ' + response.status);
            }
            return response.data;
        } catch (error: any) {
            throw new Error('Unable to connect to File Hunter');
        }
    }
}

class ExpiringVariable {
  private value: any | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private ttlInMs: number;

  constructor(ttlInMs: number) {
    this.ttlInMs = ttlInMs;
  }

  public set(newValue: any): void {
    this.value = newValue;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.value = null;
      this.timeoutId = null;
    }, this.ttlInMs);
  }

  public get(): any | null {
    return this.value;
  }

  public clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.value = null;
  }
}
