import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { EventSource } from '../models/event';
import { Game } from '../models/game';
import { GameSecondaryData } from '../models/secondary-data';
import { Totals } from '../models/totals';
import { LaunchActivityService } from './launch-activity.service';
import { UndoService } from './undo.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private ipc: IpcRenderer;

  constructor(private launchActivityService: LaunchActivityService, private undoService: UndoService) {
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

  async launchGame(game: Game): Promise<string> {
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
      this.ipc.send('launchGame', game, time);
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
          gamesToUpdate.forEach(game => {
            const updatedGame: Game = Object.assign({}, game);
            updatedGame.machine = machine;
            updatedGame.fddMode = fddMode;
            updatedGame.inputDevice = inputDevice;
            updatedGame.connectGFX9000 = connectGFX9000;
            this.undoService.addToHistory(game, updatedGame);
          });
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
          gamesToUpdate.forEach(game => {
            const updatedGame: Game = Object.assign({}, game);
            updatedGame.bluemsxArguments = args;
            updatedGame.bluemsxOverrideSettings = overrideSettings;
            this.undoService.addToHistory(game, updatedGame);
          });
        }
        resolve(updated);
      });
      this.ipc.send('setBluemsxArguments', gamesToUpdate, args, overrideSettings);
    });
  }

  async updateGame(oldGame: Game, newGame: Game, restoreMode: boolean = false) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('updateGameResponse', (event, err: boolean) => {
        if (!err && !restoreMode) {
          this.undoService.addToHistory(oldGame, newGame);
        }
        resolve(err);
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
}
