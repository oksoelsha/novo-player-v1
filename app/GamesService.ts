import { BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import Datastore from 'nedb';
import * as path from 'path';
import { Game } from '../src/app/models/game';
import { Totals } from '../src/app/models/totals';
import { GameDO } from './data/game-do';
import { EmulatorRepositoryService, RepositoryData } from './EmulatorRepositoryService';
import { ExtraDataService } from './ExtraDataService';
import { HashService } from './HashService';
import { PersistenceUtils } from './utils/PersistenceUtils';

export class GamesService {

    private database: Datastore;
    private readonly databaseFile: string = path.join(PersistenceUtils.getStoragePath(), 'datafile');

    constructor(private win: BrowserWindow, private emulatorRepositoryService: EmulatorRepositoryService,
        private hashService: HashService, private extraDataService: ExtraDataService) {
        this.database = new Datastore({ filename: this.databaseFile, autoload: true });
        this.init();
    }

    saveGameFromScan(game: Game): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let gameDO: GameDO = new GameDO(game);
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

                        gameDO.generationMSXId = extraData.generationMSXID;
                        gameDO.screenshotSuffix = extraData.suffix;
                        gameDO.generations = extraData.generations;
                        gameDO.sounds = extraData.soundChips;
                        gameDO.genre1 = extraData.genre1;
                        gameDO.genre2 = extraData.genre2;
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
        let self = this;
        let gameDO: GameDO = new GameDO(game);
        this.database.insert(gameDO, (err: any, savedGame: GameDO) => {
            self.win.webContents.send('saveGameResponse', err == null);
        });
    }

    private removeGames(games: Game[]) {
        let self = this;
        let totalAttemptedRemoves: number = 0;
        let totalRemoved: number = 0;
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

    private updateMultipleGames(games: Game[], fields: string[], values: any[], response: string) {
        const self = this;
        let totalAttemptedUpdates: number = 0;
        let totalUpdated: number = 0;
        games.forEach(game => {
            let gameDO: GameDO = new GameDO(game);
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
        let self = this;
        let listings: string[] = [];
        let tempSet = new Set();
        this.database.find({}, (err: any, entries: any) => {
            for (let entry of entries) {
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
            for (const entry of entries) {
                const gameDO: GameDO = new GameDO(entry);
                const game: Game = new Game(entry.name, entry._id, entry.size);

                for (const field of PersistenceUtils.fieldsToPersist) {
                    if (gameDO[field] != game[field]) {
                        game[field] = gameDO[field];
                    }
                }

                const repositoryInfo = this.emulatorRepositoryService.getRepositoryInfo();
                if (repositoryInfo != null) {
                    const repositoryData: RepositoryData = repositoryInfo.get(entry._id);
                    if (repositoryData != null) {
                        game.setTitle(repositoryData.title);
                        game.setSystem(repositoryData.system);
                        game.setCompany(repositoryData.company);
                        game.setYear(this.getYear(repositoryData.year));
                        game.setCountry(repositoryData.country);
                        game.setMapper(repositoryData.mapper);
                        game.setRemark(repositoryData.remark);
                        game.setStart(repositoryData.start);
                    }
                }
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
        let self = this;
        let gameDO: GameDO = new GameDO(newGame);

        if (this.getGameMainFile(oldGame) == this.getGameMainFile(newGame)) {
            this.database.update({ _id: oldGame.sha1Code }, gameDO, {}, () => {
                self.win.webContents.send('updateGameResponse');
            });
        } else {
            if(!fs.existsSync(this.getGameMainFile(newGame))) {
                self.win.webContents.send('updateGameResponse', true);
            } else {
                this.hashService.getSha1Code(this.getGameMainFile(newGame)).then(data => {
                    if (oldGame.sha1Code == data.hash) {
                        //only allow a game to be updated if the changed main file has the same hash
                        //e.g. this can happen if the file was moved to a different folder
                        this.database.update({ _id: oldGame.sha1Code }, gameDO, {}, () => {
                            self.win.webContents.send('updateGameResponse');
                        });
                    } else {
                        self.win.webContents.send('updateGameResponse', true);
                    }
                });    
            }
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
        let self = this;
        let totals: Totals;
        let listings:number = 0;
        let games:number = 0;
        let roms:number = 0;
        let disks:number = 0;
        let tapes:number = 0;
        let harddisks:number = 0;
        let laserdiscs:number = 0;
        let tempSet = new Set();
        this.database.find({}, (err: any, entries: any) => {
            games = entries.length;
            for (let entry of entries) {
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
        let self = this;
        let games: Game[] = [];
        let sanitizedText: string = text.replace(/[(){}[\]\\?|]/g,'');

        this.database.find({$or: [{name:{$regex: new RegExp(sanitizedText, 'i') }}, {_id:{$regex: new RegExp('^' + sanitizedText, 'i')}}]}, (err: any, entries: any) => {
            let index: number = 0;
            for (let entry of entries) {
                let gameDO: GameDO = new GameDO(entry);
                let game: Game = new Game(entry.name, entry._id, entry.size);
                game.setListing(gameDO.listing);

                games.push(game)
                if (++index == 10) {
                    break;
                }
            }
            games.sort((a: Game, b: Game) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

            self.win.webContents.send('searchResponse_' + text, games);
        });
    }

    private renameListing(oldName: string, newName: string) {
        let self = this;
        this.database.update({ listing: oldName }, { $set: { listing: newName } }, { multi: true }, () => {
            self.win.webContents.send('renameListingResponse');
        });
    }

    private deleteListing(name: string) {
        let self = this;
        this.database.remove({ listing: name }, { multi: true }, () => {
            self.win.webContents.send('deleteListingResponse', true);
        });
    }

    private setFavoritesFlag(game: Game, flag: boolean) {
        let self = this;
        this.database.update({ _id: game.sha1Code }, { $set: { favorite: flag } }, {}, () => {
            self.win.webContents.send('setFavoritesFlagResponse', false);
        });
    }

    private getFavorites() {
        let self = this;
        let favorites: Game[] = [];
        this.database.find({ favorite: true }, (err: any, entries: any) => {
            for (let entry of entries) {
                let gameDO: GameDO = new GameDO(entry);
                let game: Game = new Game(entry.name, entry._id, entry.size);
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
}
