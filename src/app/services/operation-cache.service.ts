import { Injectable } from '@angular/core';
import Cache from 'timed-cache';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class OperationCacheService {

  readonly cacheTTL = 6 * 60 * 60 * 1000; // 6 hours
  private recentlyAddedCache = new Cache({ defaultTtl: this.cacheTTL });
  private recentlyUpdatedCache = new Cache({ defaultTtl: this.cacheTTL });

  constructor() { }

  cacheAddOperation(game: Game) {
    this.recentlyAddedCache.put(game.sha1Code, new Date().getMilliseconds());
  }

  cacheUpdateOperation(game: Game) {
    this.recentlyUpdatedCache.put(game.sha1Code, new Date().getMilliseconds());
  }

  isRecentlyAdded(game: Game): boolean {
    return this.recentlyAddedCache.get(game.sha1Code) != null;
  }

  isRecentlyUpdated(game: Game): boolean {
    return this.recentlyUpdatedCache.get(game.sha1Code) != null;
  }
}
