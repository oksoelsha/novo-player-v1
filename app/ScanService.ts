import { BrowserWindow } from 'electron';
import { ExtraData, ExtraDataService } from './ExtraDataService';
import * as fs from 'fs';
import * as path from 'path';
import { FileTypeUtils } from './utils/FileTypeUtils';
import { Game } from '../src/app/models/game';
import { EmulatorRepositoryService, RepositoryData } from './EmulatorRepositoryService';
import { GamesService } from './GamesService';
import { HashService } from './HashService';

export class ScanService {
    private extraDataInfo: Map<string, ExtraData>;
    private repositoryInfo: Map<string, RepositoryData>;
    private totalFilesToScan = 0;
    private scannedFilesCounter = 0;
    private addedGames: Game[] = [];

    constructor(
        private win: BrowserWindow,
        private extraDataService: ExtraDataService,
        private emulatorRepositoryService: EmulatorRepositoryService,
        private gamesService: GamesService,
        private hashService: HashService) {

        this.extraDataInfo = extraDataService.getExtraDataInfo();
        this.repositoryInfo = emulatorRepositoryService.getRepositoryInfo();
    }

    start(items: string[], listing: string, machine: string) {
        // before scanning, first get total files in given file and directories
        this.totalFilesToScan = this.countTotalFilesToScan(items);

        this.scan(items, listing, machine);
    }

    private countTotalFilesToScan(items: string[]): number {
        let count = 0;
        for (const item of items) {
            count += this.getTotalFiles(item);
        }
        return count;
    }

    private getTotalFiles(item: string): number {
        if (fs.statSync(item).isDirectory()) {
            const contents = fs.readdirSync(item, 'utf8');
            let count = contents.length;
            contents.forEach(one => {
                let fullPath: string = path.join(item, one);
                if (fs.statSync(fullPath).isDirectory()) {
                    count += this.getTotalFiles(fullPath) - 1;
                }
            });
            return count;
        } else {
            return 1;
        }
    }

    private scan(items: string[], listing: string, machine: string) {
        for (const item of items) {
            this.readItem(item, listing, machine);
        }
    }

    private readItem(item: string, listing: string, machine: string) {
        if (fs.statSync(item).isDirectory()) {
            const currentDirectory = fs.readdirSync(item, 'utf8');
            currentDirectory.forEach(file => {
                const fullPath = path.join(item, file);
                this.readItem(fullPath, listing, machine);
            });
        } else {
            if (FileTypeUtils.isMSXFile(item)) {
                this.processFile(item, listing, machine);
            } else {
                this.incrementScanCounterAndCheckIfFinished();
            }
        }
    }

    private incrementScanCounterAndCheckIfFinished() {
        this.scannedFilesCounter++;
        if (this.scannedFilesCounter % 50 === 0) {
            this.win.webContents.send('scanProgress', this.scannedFilesCounter, this.totalFilesToScan);
        }
        if (this.scannedFilesCounter === this.totalFilesToScan) {
            this.finishScan();
        }
    }

    private finishScan() {
        this.win.webContents.send('scanResponse', this.addedGames);
    }

    private processFile(filename: string, listing: string, machine: string) {
        const sha1 = this.hashService.getSha1Code(filename);

        sha1.then((data: any) => {
            if (data != null) {
                const extraData = this.extraDataInfo.get(data.hash);
                const game = new Game(this.getGameName(data.hash, data.filename), data.hash, data.size);

                this.setMainFileForGame(game, filename, data.filename);
                game.setMachine(machine);
                game.setListing(listing);

                if (extraData != null) {
                    game.setGenerationMSXId(extraData.generationMSXID);
                    game.setScreenshotSuffix(extraData.suffix);
                    game.setGenerations(extraData.generations);
                    game.setSounds(extraData.soundChips);
                    game.setGenre1(extraData.genre1);
                    game.setGenre2(extraData.genre2);
                }

                this.gamesService.saveGameFromScan(game).then((success:boolean) => {
                    if (success) {
                        this.addedGames.push(game);
                    }
                    this.incrementScanCounterAndCheckIfFinished();
                });
            } else {
                this.incrementScanCounterAndCheckIfFinished();
            }
        }).catch(error => this.incrementScanCounterAndCheckIfFinished());
    }

    private setMainFileForGame(game: Game, filename: string, realFilename: string ) {
        if (FileTypeUtils.isROM(realFilename)) {
            game.setRomA(filename);
        } else if (FileTypeUtils.isDisk(realFilename)) {
            if (game.size <= FileTypeUtils.MAX_DISK_FILE_SIZE) {
                game.setDiskA(filename);
            } else {
                game.setHarddisk(filename);
                game.setExtensionRom(FileTypeUtils.EXTENSION_ROM_IDE);
            }
        } else if (FileTypeUtils.isTape(realFilename)) {
            game.setTape(filename);
        } else if (FileTypeUtils.isHarddisk(realFilename)) {
            game.setHarddisk(filename);
            game.setExtensionRom(FileTypeUtils.EXTENSION_ROM_IDE);
        } else if (FileTypeUtils.isLaserdisc(realFilename)) {
            game.setLaserdisc(filename);
        }
    }
 
    private getGameName(hash: string, file: string): string {
        if (this.repositoryInfo != null) {
            const repositoryData = this.repositoryInfo.get(hash);
            if (repositoryData != null) {
                //force game title to be string for account for game names that are numbers (e.g. 1942)
                return repositoryData.softwareData.title.toString();
            } else {
                return FileTypeUtils.getFilenameWithoutExt(path.basename(file));
            }
        } else {
            return FileTypeUtils.getFilenameWithoutExt(path.basename(file));
        }
    }
}
