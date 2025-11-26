import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Filters } from '../models/filters';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  private ipc: IpcRenderer;
  private filters = new Filters();

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  getFilters(): Filters {
    return this.filters;
  }

  filter(games: Game[], filters: Filters): Game[] {
    const filteredGames: Game[] = [];
    if (!filters || filters.filters.length === 0) {
      games.forEach(game => {
        filteredGames.push(game);
      });
      return filteredGames;
    }
    games.forEach(game => {
      let included = true;
      let done = false;
      let differentTypesIndex = 0;
      while (!done && differentTypesIndex < filters.filters.length) {
        const sameTypeFilters = filters.filters[differentTypesIndex];
        let sameTypeIndex = 0;
        included = false;
        while (!included && sameTypeIndex < sameTypeFilters.length) {
          included = sameTypeFilters[sameTypeIndex++].isFiltered(game);
        }
        if (!included) {
          done = true;
        } else {
          differentTypesIndex++;
        }
      }
      if (included) {
        filteredGames.push(game);
      }
    });
    return filteredGames;
  }

  async save(filters: any) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('saveFiltersResponse', (event, saved: boolean) => {
        resolve(saved);
      });
      this.ipc.send('saveFilters', filters);
    });
  }

  async getSavedFilters(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.ipc.once('getFiltersResponse', (event, filters) => {
        resolve(filters);
      });
      this.ipc.send('getFilters');
    });
  }

  async delete(filters: any) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('deleteFiltersResponse', (event, deleted: boolean) => {
        resolve(deleted);
      });
      this.ipc.send('deleteFilters', filters);
    });
  }
}
