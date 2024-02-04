import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { EventSource } from '../models/event';
import { Game } from '../models/game';
import { QuickLaunchData } from '../models/quick-launch-data';
import { GameSavedState } from '../models/saved-state';
import { GameSecondaryData } from '../models/secondary-data';
import { Totals } from '../models/totals';
import { LaunchActivityService } from './launch-activity.service';
import { OperationCacheService } from './operation-cache.service';
import { UndoService } from './undo.service';
import { GamePasswordsInfo } from '../models/game-passwords-info';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private ipc: IpcRenderer;

  constructor(private launchActivityService: LaunchActivityService, private undoService: UndoService,
    private operationCacheService: OperationCacheService) {
    this.ipc = window.require('electron').ipcRenderer;
  }

  async getListings(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.ipc.once('getListingsResponse', (event, listings) => {
        listings.sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
        resolve(listings);
      });
      this.ipc.send('getListings');
    });
  }

  async getGames(listing: string): Promise<Game[]> {
    return new Promise<Game[]>((resolve, reject) => {
      this.ipc.once('getGamesResponse', (event, games) => {
        resolve(games);
      });
      this.ipc.send('getGames', listing);
    });
  }

  async launchGameOnOpenMSX(game: Game, state: string = null): Promise<string> {
    const time: number = Date.now();
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('launchGameResponse' + time, (event, errorMessage: string) => {
        // this resolving means that either openMSX failed to start or the window was closed
        this.launchActivityService.recordGameFinish(game, time);
        resolve(errorMessage);
      });
      this.ipc.once('launchGameProcessIdResponse' + game.sha1Code, (event, pid: number) => {
        this.launchActivityService.recordGameStart(game, time, pid,  EventSource.openMSX);
      });
      this.ipc.send('launchGame', game, time, state);
    });
  }

  async quickLaunchOnOpenMSX(quickLaunchData: QuickLaunchData): Promise<string> {
    const time: number = Date.now();
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('launchGameResponse' + time, (event, errorMessage: string) => {
        // this resolving means that either openMSX failed to start or the window was closed
        this.launchActivityService.recordGameFinish(null, time);
        resolve(errorMessage);
      });
      this.ipc.once('quickLaunchProcessIdResponse' + time, (event, pid: number, filename: string) => {
        let displayName: string;
        if (filename != null) {
          displayName = '<' + filename + '>';
        } else {
          displayName = '<>';
        }
        const game = new Game(displayName, '', 0);
        this.launchActivityService.recordGameStart(game, time, pid,  EventSource.openMSX);
      });
      this.ipc.send('quickLaunch', quickLaunchData, time);
    });
  }

  async launchGameOnBlueMSX(game: Game): Promise<string> {
    const time: number = Date.now();
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('launchGameOnBlueMSXResponse' + time, (event, errorMessage: string) => {
        // this resolving means that either blueMSX failed to start or the window was closed
        this.launchActivityService.recordGameFinish(game, time);
        resolve(errorMessage);
      });
      this.launchActivityService.recordGameStart(game, time, 0, EventSource.blueMSX);
      this.ipc.send('launchGameOnBlueMSX', game, time);
    });
  }

  async saveGame(game: Game) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('saveGameResponse', (event, removed: boolean) => {
        resolve(removed);
      });
      this.ipc.send('saveGame', game);
    });
  }

  async removeGames(gamesToRemove: Game[]) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('removeGamesResponse', (event, removed: boolean) => {
        if (removed) {
          gamesToRemove.forEach(game => {
            this.undoService.addToHistory(game);
          });
        }
        resolve(removed);
      });
      this.ipc.send('removeGames', gamesToRemove);
    });
  }

  async moveGames(gamesToMove: Game[], newListing: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('moveGamesResponse', (event, moved: boolean) => {
        if (moved) {
          gamesToMove.forEach(game => {
            const updatedGame: Game = Object.assign({}, game);
            updatedGame.listing = newListing;
            this.undoService.addToHistory(game, updatedGame);
            this.operationCacheService.cacheUpdateOperation(game);
          });
        }
        resolve(moved);
      });
      this.ipc.send('moveGames', gamesToMove, newListing);
    });
  }

  async updateHardware(gamesToUpdate: Game[], machine: string, fddMode: number, inputDevice: number, connectGFX9000: boolean) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('updateHardwareResponse', (event, updated: boolean) => {
        if (updated) {
          for (const game of gamesToUpdate) {
            const oldGame = Object.assign({}, game);
            game.machine = machine;
            game.fddMode = fddMode;
            game.inputDevice = inputDevice;
            game.connectGFX9000 = connectGFX9000;
            this.undoService.addToHistory(oldGame, game);
            this.operationCacheService.cacheUpdateOperation(game);
          }
        }
        resolve(updated);
      });
      this.ipc.send('updateHardware', gamesToUpdate, machine, fddMode, inputDevice, connectGFX9000);
    });
  }

  async setBluemsxArguments(gamesToUpdate: Game[], args: string, overrideSettings: boolean) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('setBluemsxArgumentsResponse', (event, updated: boolean) => {
        if (updated) {
          for (const game of gamesToUpdate) {
            const oldGame = Object.assign({}, game);
            game.bluemsxArguments = args;
            game.bluemsxOverrideSettings = overrideSettings;
            this.undoService.addToHistory(oldGame, game);
            this.operationCacheService.cacheUpdateOperation(game);
          }
        }
        resolve(updated);
      });
      this.ipc.send('setBluemsxArguments', gamesToUpdate, args, overrideSettings);
    });
  }

  async setWebmsxMachine(gamesToUpdate: Game[], machine: number) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('setWebmsxMachineResponse', (event, updated: boolean) => {
        if (updated) {
          for (const game of gamesToUpdate) {
            const oldGame = Object.assign({}, game);
            game.webmsxMachine = machine;
            this.undoService.addToHistory(oldGame, game);
            this.operationCacheService.cacheUpdateOperation(game);
          }
        }
        resolve(updated);
      });
      this.ipc.send('setWebmsxMachine', gamesToUpdate, machine);
    });
  }

  async updateGame(oldGame: Game, newGame: Game, restoreMode: boolean = false) {
    return new Promise<Game>((resolve, reject) => {
      this.ipc.once('updateGameResponse', (event, updatedGame: Game) => {
        if (updatedGame && !restoreMode) {
          this.undoService.addToHistory(oldGame, updatedGame);
          this.operationCacheService.cacheUpdateOperation(updatedGame);
        }
        resolve(updatedGame);
      });
      this.ipc.send('updateGame', oldGame, newGame);
    });
  }

  async getSecondaryData(game: Game): Promise<GameSecondaryData> {
    return new Promise<GameSecondaryData>((resolve, reject) => {
      this.ipc.once('getSecondaryDataResponse' + game.sha1Code, (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getSecondaryData', game.sha1Code, game.generationMSXId, game.screenshotSuffix);
    });
  }

  exploreFile(file: string) {
    this.ipc.send('openFileExplorer', file);
  }

  exploreOpenMSXScreenshotFile(imagefile: string) {
    this.ipc.send('openOpenMSXScreenshotFile', imagefile);
  }

  openExternally(address: string) {
    this.ipc.send('openExternally', address);
  }

  async getTotals(): Promise<Totals> {
    return new Promise<Totals>((resolve, reject) => {
      this.ipc.once('getTotalsResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getTotals');
    });
  }

  async getSearch(text: string): Promise<Game[]> {
    return new Promise<Game[]>((resolve, reject) => {
      this.ipc.once('searchResponse_' + text, (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('search', text);
    });
  }

  async renameListing(oldName: string, newName: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('renameListingResponse', (event, err: boolean) => {
        resolve(err);
      });
      this.ipc.send('renameListing', oldName, newName);
    });
  }

  async deleteListing(name: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('deleteListingResponse', (event, removed: boolean) => {
        resolve(removed);
      });
      this.ipc.send('deleteListing', name);
    });
  }

  async getRelatedGames(game: Game): Promise<Game[]> {
    return new Promise<Game[]>((resolve, reject) => {
      this.ipc.once('findRelatedGamesResponse', (event, relatedGames: Game[]) => {
        resolve(relatedGames);
      });
      this.ipc.send('findRelatedGames', game);
    });
  }

  async setFavoritesFlag(game: Game, flag: boolean) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('setFavoritesFlagResponse', (event, err: boolean) => {
        resolve(err);
      });
      this.ipc.send('setFavoritesFlag', game, flag);
    });
  }

  async getFavorites(): Promise<Game[]> {
    return new Promise<Game[]>((resolve, reject) => {
      this.ipc.once('getFavoritesResponse', (event, favorites) => {
        resolve(favorites);
      });
      this.ipc.send('getFavorites');
    });
  }

  async getGameSavedStates(game: Game): Promise<GameSavedState[]> {
    return new Promise<GameSavedState[]>((resolve, reject) => {
      this.ipc.once('getGameSavedStatesResponse' + game.sha1Code, (event, savedStates) => {
        resolve(savedStates);
      });
      this.ipc.send('getGameSavedStates', game.sha1Code);
    });
  }

  async deleteGameSavedState(state: GameSavedState): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('deleteGameSavedStateResponse', (event, deleted) => {
        resolve(deleted);
      });
      this.ipc.send('deleteGameSavedState', state);
    });
  }

  async getGamePasswords(game: Game): Promise<GamePasswordsInfo> {
    return new Promise<GamePasswordsInfo>((resolve, reject) => {
      this.ipc.once('getGamePasswordsResponse' + game.generationMSXId, (event, savedStates) => {
        resolve(savedStates);
      });
      this.ipc.send('getGamePasswords', game.generationMSXId);
    });
  }

  async getMoreGameHashes(game: Game): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.ipc.once('getMoreGameHashesResponse', (event, hashes: any) => {
        resolve(hashes);
      });
      this.ipc.send('getMoreGameHashes', game);
    });
  }
}
