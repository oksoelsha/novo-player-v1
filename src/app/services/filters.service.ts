import { Injectable } from '@angular/core';
import { Filters } from '../models/filters';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  private filters = new Filters();

  constructor() { }

  getFilters(): Filters {
    return this.filters;
  }

  filter(games: Game[], filters: Filters): Game[] {
    if (!filters || filters.filters.length === 0) {
      return games;
    }
    const filteredGames: Game[] = [];
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
}
