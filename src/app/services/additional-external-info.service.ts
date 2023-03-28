import { Injectable } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class AdditionalExternalInfoService {

  private readonly idToName = new Map<number, string>();

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
        return { searchString: searchString, response: res };
      });
  };

  async getImages(imagesUrl: string, giantbombApiKey: string): Promise<any[]> {
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
    const searchString = this.idToName.get(game.generationMSXId);
    if (searchString) {
      return searchString;
    } else if (game.title) {
      // naming convention at Giant Bomb is different that the one used in openMSX,
      // so we'll adjust the name in the hopes of finding the game
      return game.title.replace(' - ', ': ');
    } else {
      return game.name;
    }
  }

  private initIdToName() {
    this.idToName.set(57, 'Hustle! Chumy');
    this.idToName.set(204, 'Exerion II: Zorni');
    this.idToName.set(263, 'Hyper Sports');
    this.idToName.set(264, 'Hyper Sports II');
    this.idToName.set(272, 'MSX Baseball');
    this.idToName.set(318, 'HAL\'s Hole In One Golf');
    this.idToName.set(319, 'Boggy \'84');
    this.idToName.set(378, 'Yie Ar Kung-Fu 2: The Emperor Yie-Gah');
    this.idToName.set(406, 'King\'s Valley');
    this.idToName.set(474, 'Ping Pong');
    this.idToName.set(478, 'Golgo 13: Ōkami no Su');
    this.idToName.set(531, 'Kung-Fu Master');
    this.idToName.set(577, 'Hydlide');
    this.idToName.set(579, 'Hyper Sports III');
    this.idToName.set(625, 'The Black Onyx');
    this.idToName.set(674, 'Yokai Tantei Chima Chima');
    this.idToName.set(695, 'Genghis Khan');
    this.idToName.set(696, 'Vampire Killer');
    this.idToName.set(730, 'Come On Picot');
    this.idToName.set(733, 'Gall Force: Defense of Chaos');
    this.idToName.set(739, 'Q*Bert');
    this.idToName.set(742, 'Gradius');
    this.idToName.set(754, 'Zanac');
    this.idToName.set(755, 'Zanac EX');
    this.idToName.set(785, 'Dunkshot');
    this.idToName.set(825, 'Hydlide II: Shine of Darkness');
    this.idToName.set(830, 'MSX Baseball II');
    this.idToName.set(841, 'The Black Onyx II: Search For The Fire Crystal');
    this.idToName.set(855, 'Knightmare');
    this.idToName.set(860, 'Valis: The Fantasm Soldier');
    this.idToName.set(873, 'Penguin Adventure');
    this.idToName.set(880, 'Romancia: Dragon Slayer Jr.');
    this.idToName.set(894, 'Wingman 2: Kitakura no Fukkatsu');
    this.idToName.set(898, 'Ultima IV: Quest of the Avatar');
    this.idToName.set(905, 'F-1 Spirit: The Way To Formula-1');
    this.idToName.set(916, 'Knightmare II: The Maze of Galious');
    this.idToName.set(929, 'King Kong 2: Yomigaeru Densetsu');
    this.idToName.set(932, 'Nemesis 2');
    this.idToName.set(939, 'Xanadu: Dragon Slayer II');
    this.idToName.set(941, 'Life Force');
    this.idToName.set(946, 'Shalom: Knightmare III');
    this.idToName.set(960, 'Snake It');
    this.idToName.set(991, 'Hydlide 3');
    this.idToName.set(993, 'Vaxol: Heavy Armed Storming Vehicle');
    this.idToName.set(1059, 'Ys II: Ancient Ys Vanished: The Final Chapter');
    this.idToName.set(1073, 'F-1 Spirit: 3D Special');
    this.idToName.set(1078, 'King\'s Valley 2');
    this.idToName.set(1079, 'King\'s Valley 2');
    this.idToName.set(1117, 'Cosmic Soldier 2: Psychic War');
    this.idToName.set(1119, 'Psychic World');
    this.idToName.set(1188, 'Parodius');
    this.idToName.set(1239, 'Ys III: Wanderers from Ys');
    this.idToName.set(1241, 'Rune Worth: Kokui no Kikoushi');
    this.idToName.set(1247, 'Pro Yakyuu Family Stadium: Pennant Race');
    this.idToName.set(1249, 'Fire Hawk: Thexder the Second Contact');
    this.idToName.set(1252, 'Valis II');
    this.idToName.set(1254, 'Nemesis 3: The Eve of Destruction');
    this.idToName.set(1257, 'Pro Yakyuu Family Stadium: Home Run Contest');
    this.idToName.set(1318, 'Intruder: Sakura Yashiki no Tansaku');
    this.idToName.set(1324, 'Master of Monsters');
    this.idToName.set(1386, 'Xak II: Rising of The Redmoon');
    this.idToName.set(1387, 'Dragon Slayer: The Legend of Heroes');
    this.idToName.set(1544, 'Illusion City - Gen\'ei Toshi');
    this.idToName.set(1545, 'Inindo: Way of the Ninja');
    this.idToName.set(1666, 'Action RPG Construction Tool: Dante 2');
    this.idToName.set(1703, 'Dead of the Brain: Shiryou no Sakebi');
    this.idToName.set(1707, 'The Tower? Of Cabin: Cabin Panic');
    this.idToName.set(1798, 'BC\'s Quest for Tires');
    this.idToName.set(1843, 'Jack Nicklaus\' Greatest 18 Holes of Major Championship Golf');
    this.idToName.set(2414, 'Who Dares Wins II');
    this.idToName.set(2601, 'BC\'s Quest for Tires II: Grog\'s Revenge');
    this.idToName.set(2911, 'The Activision Decathlon');
    this.idToName.set(3278, 'The Day II');
    this.idToName.set(3280, 'Agi Gongnyong Dooly');
    this.idToName.set(3687, 'Universe: Unknown');
  }
}
