import { BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import Datastore from 'nedb';
import * as path from 'path';
import { Game } from '../src/app/models/game';
import { Totals } from '../src/app/models/totals';
import { GameDO } from './data/game-do';
import { EmulatorRepositoryService, RepositoryData } from './EmulatorRepositoryService';
import { ExtraData, ExtraDataService } from './ExtraDataService';
import { HashService } from './HashService';
import { PersistenceUtils } from './utils/PersistenceUtils';
import { EnvironmentService } from './EnvironmentService';
import { GameUtils } from './utils/GameUtils';

export class GamesService {

    private database: Datastore;
    private readonly databaseFile = path.join(PersistenceUtils.getStoragePath(), 'datafile');

    constructor(private win: BrowserWindow, private emulatorRepositoryService: EmulatorRepositoryService,
        private hashService: HashService, private extraDataService: ExtraDataService, private environmentService: EnvironmentService) {
        this.database = new Datastore({ filename: this.databaseFile, autoload: true });
        this.init();
    }

    async checkIfNeedUpdateDbWithExtraData() {
        return new Promise<void>(async (resolve, reject) => {
            if (this.environmentService.isNeedToUpdateApplicationData()) {
                await this.updateGamesForNewExtraData();
                this.environmentService.saveEnvironmentDataForNewApplicationVersion();
            }
            resolve();
        });
    }

    reloadDatabase() {
        this.database.loadDatabase((err: any) => {
            if (err) {
                console.log('Error reloading db', err);
            }
        });
    }

    getDatabaseFile(): string {
        return this.databaseFile;
    }

    saveGameFromScan(game: Game): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const gameDO = new GameDO(game);
            this.database.insert(gameDO, (err: any, savedGame: GameDO) => {
                return resolve(err == null);
            });
        });
    }

    async getListing(sha1Code: string): Promise<string> {
        const listing = await new Promise<string>((resolve, reject) => {
            this.database.findOne({ _id: sha1Code }, (err: any, entry: any) => {
                if (entry) {
                    resolve(entry.listing);
                } else {
                    resolve('');
                }
            });
        });
        return listing;
    }

    async updateGamesForNewExtraData() {
        await new Promise<void>((resolve, reject) => {
            this.database.find({}, async (err: any, entries: any) => {
                const extraDataInfo = this.extraDataService.getExtraDataInfo();
                for (const entry of entries) {
                    const extraData = extraDataInfo.get(entry._id);
                    if (extraData) {
                        const gameDO = new GameDO(entry);
                        gameDO._id = entry._id;
                        this.updateGameDOWithExtraData(gameDO, extraData);
                        await this.updateGameWithNewExtraData(gameDO);
                    }
                }
                resolve();
            });
        });
    }

    private init() {
        ipcMain.on('getListings', (event, arg) => {
            this.getListings();
        });

        ipcMain.on('getGames', (event, listing: string) => {
            this.getGames(listing);
        });

        ipcMain.on('saveGame', (event, game: Game) => {
            this.saveGame(game);
        });

        ipcMain.on('removeGames', (event, games: Game[]) => {
            this.removeGames(games);
        });

        ipcMain.on('updateGame', (event, oldGame: Game, newGame: Game) => {
            this.updateGame(oldGame, newGame);
        });

        ipcMain.on('updateHardware', (event, games: Game[], machine: string, fddMode: number, inputDevice: number, connectGFX9000: boolean) => {
            this.updateHardware(games, machine, fddMode, inputDevice, connectGFX9000);
        });

        ipcMain.on('moveGames', (event, games: Game[], newListing: string) => {
            this.moveGames(games, newListing);
        });

        ipcMain.on('setBluemsxArguments', (event, games: Game[], args: string, overrideSettings: boolean) => {
            this.setBluemsxArguments(games, args, overrideSettings);
        });

        ipcMain.on('setWebmsxMachine', (event, games: Game[], machine: number) => {
            this.setWebmsxMachine(games, machine);
        });

        ipcMain.on('setEmuliciousArguments', (event, games: Game[], args: string, overrideSettings: boolean) => {
            this.setEmuliciousArguments(games, args, overrideSettings);
        });

        ipcMain.on('getTotals', (event, arg) => {
            this.getTotals();
        });

        ipcMain.on('search', (event, text: string) => {
            this.search(text);
        });

        ipcMain.on('renameListing', (event, oldName: string, newName: string) => {
            this.renameListing(oldName, newName);
        });

        ipcMain.on('deleteListing', (event, name: string) => {
            this.deleteListing(name);
        });

        ipcMain.on('setFavoritesFlag', (event, game: Game, flag: boolean) => {
            this.setFavoritesFlag(game, flag);
        });

        ipcMain.on('getFavorites', (event) => {
            this.getFavorites();
        });
    }

    private saveGame(game: Game) {
        const self = this;
        const gameDO = new GameDO(game);
        this.database.insert(gameDO, (err: any, savedGame: GameDO) => {
            self.win.webContents.send('saveGameResponse', err == null);
        });
    }

    private removeGames(games: Game[]) {
        const self = this;
        let totalAttemptedRemoves = 0;
        let totalRemoved = 0;
        games.forEach(game => {
            this.database.remove({ _id: game.sha1Code }, {}, (err: any, numRemoved: number) => {
                totalRemoved = totalRemoved + numRemoved;
                totalAttemptedRemoves++;
                if (totalAttemptedRemoves == games.length) {
                    self.win.webContents.send('removeGamesResponse', totalRemoved == games.length);
                }
            });
        });
    }

    private updateHardware(games: Game[], machine: string, fddMode: number, inputDevice: number, connectGFX9000: boolean) {
        this.updateMultipleGames(games, ['machine', 'fddMode', 'inputDevice', 'connectGFX9000'],
            [machine, fddMode, inputDevice, connectGFX9000], 'updateHardwareResponse');
    }

    private moveGames(games: Game[], newListing: string) {
        this.updateMultipleGames(games, ['listing'], [newListing], 'moveGamesResponse');
    }

    private setBluemsxArguments(games: Game[], args: string, overrideSettings: boolean) {
        this.updateMultipleGames(games, ['bluemsxArguments', 'bluemsxOverrideSettings'],
            [args, overrideSettings], 'setBluemsxArgumentsResponse');
    }

    private setWebmsxMachine(games: Game[], machine: number) {
        this.updateMultipleGames(games, ['webmsxMachine'], [machine], 'setWebmsxMachineResponse');
    }

    private setEmuliciousArguments(games: Game[], args: string, overrideSettings: boolean) {
        this.updateMultipleGames(games, ['emuliciousArguments', 'emuliciousOverrideSettings'],
            [args, overrideSettings], 'setEmuliciousArgumentsResponse');
    }

    private updateMultipleGames(games: Game[], fields: string[], values: any[], response: string) {
        const self = this;
        let totalAttemptedUpdates = 0;
        let totalUpdated = 0;
        games.forEach(game => {
            const gameDO = new GameDO(game);
            for (let index = 0; index < fields.length; index++) {
                gameDO[fields[index]] = values[index];
            }
            this.database.update({ _id: game.sha1Code }, gameDO, {}, (err: any, numUpdated: number) => {
                totalUpdated = totalUpdated + numUpdated;
                totalAttemptedUpdates++;
                if (totalAttemptedUpdates == games.length) {
                    self.win.webContents.send(response, totalUpdated == games.length);
                }
            });
        });
    }

    private getListings() {
        const self = this;
        const listings: string[] = [];
        const tempSet = new Set();
        this.database.find({}, (err: any, entries: any) => {
            for (const entry of entries) {
                if (!tempSet.has(entry.listing)) {
                    tempSet.add(entry.listing);
                    listings.push(entry.listing);
                }
            }

            self.win.webContents.send('getListingsResponse', listings);
        });
    }

    private getGames(listing: string) {
        const self = this;
        const games: Game[] = [];
        this.database.find({ listing: listing }, (err: any, entries: any) => {
            const repositoryInfo = this.emulatorRepositoryService.getRepositoryInfo();
            for (const entry of entries) {
                const gameDO = new GameDO(entry);
                const game = new Game(entry.name, entry._id, entry.size);

                for (const field of PersistenceUtils.fieldsToPersist) {
                    if (gameDO[field] != game[field]) {
                        game[field] = gameDO[field];
                    }
                }
                this.populateGameWithOpenMSXRepositoryData(game, repositoryInfo);
                games.push(game);
            }
            self.win.webContents.send('getGamesResponse', games);
        });
    }

    private getYear(year: string): string {
        if (year.length > 4) {
            return year.slice(year.length - 4);
        } else {
            return year;
        }
    }

    private updateGame(oldGame: Game, newGame: Game) {
        const self = this;
        const gameDO = new GameDO(newGame);
        const gameMainFile = GameUtils.getGameMainFile(newGame);
        if (fs.existsSync(gameMainFile)) {
            this.hashService.getSha1Code(gameMainFile).then(data => {
                if (data.hash === oldGame.sha1Code) {
                    this.database.update({ _id: oldGame.sha1Code }, gameDO, {}, () => {
                        self.win.webContents.send('updateGameResponse', newGame);
                    });
                } else {
                    gameDO._id = data.hash;
                    gameDO.size = data.size;
                    const extraDataInfo = this.extraDataService.getExtraDataInfo();
                    const extraData = extraDataInfo.get(gameDO._id);
                    this.updateGameDOWithExtraData(gameDO, extraData);

                    this.database.insert(gameDO, (err: any, savedGame: GameDO) => {
                        if (err) {
                            self.win.webContents.send('updateGameResponse', null);
                        } else {
                            this.database.remove({ _id: oldGame.sha1Code }, {}, (removeErr: any) => {
                                if (removeErr) {
                                    self.win.webContents.send('updateGameResponse', null);
                                } else {
                                    const updatedGame = this.constructGame(newGame, gameDO);
                                    self.win.webContents.send('updateGameResponse', updatedGame);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            self.win.webContents.send('updateGameResponse', null);
        }
    }

    private getGameMainFile(game: Game): string {
        if (game.romA != null) {
            return game.romA;
        } else if (game.diskA != null) {
            return game.diskA;
        } else if (game.tape != null) {
            return game.tape;
        } else if (game.harddisk != null) {
            return game.harddisk;
        } else if (game.laserdisc != null) {
            return game.laserdisc;
        } else {
            return '';
        }
    }

    private getTotals() {
        const self = this;
        let totals: Totals;
        let listings = 0;
        let games = 0;
        let roms = 0;
        let disks = 0;
        let tapes = 0;
        let harddisks = 0;
        let laserdiscs = 0;
        const tempSet = new Set();
        this.database.find({}, (err: any, entries: any) => {
            games = entries.length;
            for (const entry of entries) {
                if (!tempSet.has(entry.listing)) {
                    tempSet.add(entry.listing);
                    listings++;
                }

                if (entry.romA != null) {
                    roms++;
                } else if (entry.diskA != null) {
                    disks++;
                } else if (entry.tape != null) {
                    tapes++;
                } else if (entry.harddisk != null) {
                    harddisks++;
                } else if (entry.laserdisc != null) {
                    laserdiscs++;
                }
            }
            totals = new Totals(listings, games, roms, disks, tapes, harddisks, laserdiscs);

            self.win.webContents.send('getTotalsResponse', totals);
        });
    }

    private search(text: string) {
        const self = this;
        const games: Game[] = [];
        const sanitizedText = text.replace(/[(){}[\]\\?|.*\\+]/g, '\\$&');

        this.database.find({ $or: [{ name: { $regex: new RegExp(sanitizedText, 'i') } }, { _id: { $regex: new RegExp('^' + sanitizedText, 'i') } }] })
            .limit(10).exec((err: any, entries: any) => {
            for (const entry of entries) {
                const game = new Game(entry.name, entry._id, entry.size);
                game.setListing(entry.listing);
                game.setRomA(entry.romA);
                game.setDiskA(entry.diskA);
                game.setTape(entry.tape);
                game.setHarddisk(entry.harddisk);
                game.setLaserdisc(entry.laserdisc);

                games.push(game)
            }
            games.sort((a: Game, b: Game) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

            self.win.webContents.send('searchResponse_' + text, games);
        });
    }

    private renameListing(oldName: string, newName: string) {
        const self = this;
        this.database.update({ listing: oldName }, { $set: { listing: newName } }, { multi: true }, () => {
            self.win.webContents.send('renameListingResponse');
        });
    }

    private deleteListing(name: string) {
        const self = this;
        this.database.remove({ listing: name }, { multi: true }, () => {
            self.win.webContents.send('deleteListingResponse', true);
        });
    }

    private setFavoritesFlag(game: Game, flag: boolean) {
        const self = this;
        this.database.update({ _id: game.sha1Code }, { $set: { favorite: flag } }, {}, () => {
            self.win.webContents.send('setFavoritesFlagResponse', false);
        });
    }

    private getFavorites() {
        const self = this;
        const favorites: Game[] = [];
        this.database.find({ favorite: true }, (err: any, entries: any) => {
            for (const entry of entries) {
                const gameDO = new GameDO(entry);
                const game = new Game(entry.name, entry._id, entry.size);
                game.setListing(gameDO.listing);
                favorites.push(game)
            }
            favorites.sort((a: Game, b: Game) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

            self.win.webContents.send('getFavoritesResponse', favorites)
        });
    }

    private async updateGameWithNewExtraData(gameDO: GameDO): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.database.update({ _id: gameDO._id }, gameDO, {}, (err: any, numUpdated: number) => {
                resolve();
            });
        });
    }

    private updateGameDOWithExtraData(gameDO: GameDO, extraData: ExtraData) {
        if (extraData == null) {
            gameDO.generationMSXId = 0;
            gameDO.screenshotSuffix = null;
            gameDO.generations = 0;
            gameDO.sounds = 0;
            gameDO.genre1 = 0;
            gameDO.genre2 = 0;
        } else {
            gameDO.generationMSXId = extraData.generationMSXID;
            gameDO.screenshotSuffix = extraData.suffix;
            gameDO.generations = extraData.generations;
            if (extraData.soundChips > 0) {
                gameDO.sounds = extraData.soundChips;
            }
            if (extraData.genre1 > 0) {
                gameDO.genre1 = extraData.genre1;
            }
            if (extraData.genre2 > 0) {
                gameDO.genre2 = extraData.genre2;
            }    
        }
        this.cleanupGameDO(gameDO);
    }

    private populateGameWithOpenMSXRepositoryData(game: Game, repositoryInfo: Map<string, RepositoryData>) {
        if (repositoryInfo != null) {
            const repositoryData = repositoryInfo.get(game.sha1Code);
            if (repositoryData != null) {
                game.setTitle(repositoryData.softwareData.title);
                game.setSystem(repositoryData.softwareData.system);
                game.setCompany(repositoryData.softwareData.company);
                game.setYear(this.getYear(repositoryData.softwareData.year));
                game.setCountry(repositoryData.softwareData.country);
                game.setMapper(repositoryData.mapper);
                game.setRemark(repositoryData.remark);
                game.setStart(repositoryData.start);
                game.setKnownDumps(this.emulatorRepositoryService.getKnownDumps(repositoryData));
            }
        }
    }

    private constructGame(game: Game, gameDO: GameDO): Game {
        const constructedGame = new Game(gameDO.name, gameDO._id, gameDO.size);
        for (const field of PersistenceUtils.fieldsToPersist) {
            if (gameDO[field] != constructedGame[field]) {
                constructedGame[field] = gameDO[field];
            }
        }
        const repositoryInfo = this.emulatorRepositoryService.getRepositoryInfo();
        this.populateGameWithOpenMSXRepositoryData(constructedGame, repositoryInfo);

        return constructedGame;
    }

    private cleanupGameDO(gameDO: GameDO) {
        Object.keys(gameDO).forEach((k) => gameDO[k] == null && delete gameDO[k]);
    }
}
