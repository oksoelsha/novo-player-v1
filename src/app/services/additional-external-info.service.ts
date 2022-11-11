import { Injectable } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class AdditionalExternalInfoService {

  private readonly idToName = new Map<number, string>()

  constructor() {
    this.initIdToName();
  }

  async getAdditionalExternalInfo(game: Game, giantbombApiKey: string): Promise<any> {
    const searchString = this.getSearchString(game);
    const params = {
      api_key: giantbombApiKey,
      format: 'json',
      filter: 'name:' + searchString
    };
    const url = 'https://www.giantbomb.com/api/games/?' + this.getQueryString(params);
    return fetch(url)
      .then(res => res.json())
      .then(res => {
        return { searchString: searchString, data: res.results };
      });
  };

  async getBoxArtImages(imagesUrl: string, giantbombApiKey: string): Promise<any[]> {
    const params = {
      api_key: giantbombApiKey,
      format: 'json',
    };
    const url = imagesUrl + '&' + this.getQueryString(params);
    return fetch(url)
      .then(res => res.json())
      .then(res => {
        return res.results as any[];
      });
  }

  private getQueryString(params: any): string {
    const queryString = [];
    for (const param in params) {
      queryString.push(param + '=' + encodeURIComponent(params[param]));
    }
    return queryString.join('&');
  }

  private getSearchString(game: Game): string {
    let searchString = this.idToName.get(game.generationMSXId);
    if (searchString) {
      return searchString;
    } else if (game.title) {
      return game.title;
    } else {
      return game.name;
    }
  }

  private initIdToName() {
    this.idToName.set(263, 'Hyper Sports');
    this.idToName.set(264, 'Hyper Sports II');
    this.idToName.set(272, 'MSX Baseball');
    this.idToName.set(378, 'Yie Ar Kung-Fu 2: The Emperor Yie-Gah');
    this.idToName.set(406, 'King\'s Valley');
    this.idToName.set(474, 'Ping Pong');
    this.idToName.set(531, 'Kung-Fu Master');
    this.idToName.set(577, 'Hydlide');
    this.idToName.set(579, 'Hyper Sports III');
    this.idToName.set(607, 'Pitfall II: Lost Caverns');
    this.idToName.set(695, 'Genghis Khan');
    this.idToName.set(696, 'Vampire Killer');
    this.idToName.set(730, 'Come On Picot');
    this.idToName.set(733, 'Gall Force: Defense of Chaos');
    this.idToName.set(742, 'Gradius');
    this.idToName.set(754, 'Zanac');
    this.idToName.set(755, 'Zanac EX');
    this.idToName.set(785, 'Dunkshot');
    this.idToName.set(825, 'Hydlide II: Shine of Darkness');
    this.idToName.set(830, 'MSX Baseball II');
    this.idToName.set(855, 'Knightmare');
    this.idToName.set(860, 'Valis: The Fantasm Soldier');
    this.idToName.set(873, 'Penguin Adventure');
    this.idToName.set(880, 'Romancia: Dragon Slayer Jr.');
    this.idToName.set(905, 'F-1 Spirit: The Way To Formula-1');
    this.idToName.set(916, 'Knightmare II: The Maze of Galious');
    this.idToName.set(929, 'King Kong 2: Yomigaeru Densetsu');
    this.idToName.set(932, 'Nemesis 2');
    this.idToName.set(939, 'Xanadu: Dragon Slayer II');
    this.idToName.set(941, 'Life Force');
    this.idToName.set(946, 'Shalom: Knightmare III');
    this.idToName.set(954, 'Super Laydock: Mission Striker');
    this.idToName.set(960, 'Snake It');
    this.idToName.set(991, 'Hydlide 3');
    this.idToName.set(993, 'Vaxol: Heavy Armed Storming Vehicle');
    this.idToName.set(1032, 'Young Sherlock: The Legacy of Doyle');
    this.idToName.set(1073, 'F-1 Spirit: 3D Special');
    this.idToName.set(1079, 'King\'s Valley 2');
    this.idToName.set(1188, 'Parodius');
    this.idToName.set(1236, 'Laydock 2: Last Attack');
    this.idToName.set(1248, 'Metal Gear 2: Solid Snake');
    this.idToName.set(1249, 'Fire Hawk: Thexder the Second Contact');
    this.idToName.set(1254, 'Nemesis 3: The Eve of Destruction');
    this.idToName.set(1387, 'Dragon Slayer: The Legend of Heroes');
  }
}
