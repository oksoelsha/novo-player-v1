import { Injectable } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class AdditionalExternalInfoService {

  private readonly idToName = new Map<number, string>();
  private readonly idsToNames = [
    [5, 'Adven\'chuta'],
    [54, 'Ninja-kun'],
    [57, 'Hustle! Chumy'],
    [108, 'Exerion'],
    [135, 'Mobile Suit Gundam: Last Shooting'],
    [153, 'Godzilla VS 3 Daikaiju'],
    [204, 'Exerion II: Zorni'],
    [207, 'Daishougai Keiba: Exciting Jockey'],
    [256, 'Nessen Koushien: Exciting Baseball'],
    [263, 'Hyper Sports'],
    [264, 'Hyper Sports II'],
    [268, 'Pachinko-U.F.O.'],
    [272, 'MSX Baseball'],
    [283, 'Pretty Sheep'],
    [313, 'Stop the Express'],
    [318, 'HAL\'s Hole In One Golf'],
    [319, 'Boggy \'84'],
    [325, 'Bomberman'],
    [378, 'Yie Ar Kung-Fu 2: The Emperor Yie-Gah'],
    [386, 'Moonsweeper'],
    [392, 'F-16 Fighting Falcon'],
    [406, 'King\'s Valley'],
    [474, 'Ping Pong'],
    [463, 'Godzilla-Kun'],
    [478, 'Golgo 13: Ōkami no Su'],
    [485, 'Xyzolog'],
    [495, 'C_So!'],
    [531, 'Kung-Fu Master'],
    [539, 'Daidassou'],
    [556, 'Choro Q'],
    [563, 'DoorDoor MK II'],
    [566, 'Dragon Slayer'],
    [568, 'Nihonkai Daikaisen'],
    [572, 'Ninja-Kid'],
    [573, 'Nobunaga\'s Ambition'],
    [575, 'Harry Fox: Yuki no Maou hen'],
    [577, 'Hydlide'],
    [579, 'Hyper Sports III'],
    [625, 'The Black Onyx'],
    [642, 'Penguin-Kun Wars'],
    [674, 'Yokai Tantei Chima Chima'],
    [695, 'Genghis Khan'],
    [696, 'Vampire Killer'],
    [729, 'The Legend of Kage'],
    [700, 'Albatross'],
    [730, 'Come On Picot'],
    [733, 'Gall Force: Defense of Chaos'],
    [739, 'Q*Bert'],
    [742, 'Gradius'],
    [754, 'Zanac'],
    [755, 'Zanac EX'],
    [756, 'The Black Bass'],
    [757, 'Romance of the Three Kingdoms'],
    [773, 'Scarlet 7: The Mightiest Women'],
    [785, 'Dunkshot'],
    [801, '10-Yard Fight'],
    [803, 'Topple Zip'],
    [804, 'Dragon Warrior'],
    [812, 'Nichiyoubi ni Uchuujin ga…?'],
    [818, 'Ninja JaJaMaru-kun'],
    [824, 'Harry Fox'],
    [825, 'Hydlide II: Shine of Darkness'],
    [829, 'Batten Tanuki no Daibōken'],
    [830, 'MSX Baseball II'],
    [841, 'The Black Onyx II: Search For The Fire Crystal'],
    [853, 'Jackie Chan in The Police Story'],
    [855, 'Knightmare'],
    [860, 'Valis: The Fantasm Soldier'],
    [869, 'Yami no Ryūō Hades no Monshō'],
    [873, 'Penguin Adventure'],
    [874, 'Youkai Yashiki'],
    [880, 'Romancia: Dragon Slayer Jr.'],
    [894, 'Wingman 2: Kitakura no Fukkatsu'],
    [900, 'Aliens: Alien 2'],
    [905, 'F-1 Spirit: The Way To Formula-1'],
    [916, 'Knightmare II: The Maze of Galious'],
    [918, 'Gall Force: Sousei no Jokyoku'],
    [923, 'Ganbare Goemon! Karakuri Douchuu'],
    [929, 'King Kong 2: Yomigaeru Densetsu'],
    [930, 'Ku Gyoku Den'],
    [931, 'Kudokikata Oshiemasu Part II: Kind Gals'],
    [932, 'Nemesis 2'],
    [939, 'Xanadu: Dragon Slayer II'],
    [941, 'Life Force'],
    [946, 'Shalom: Knightmare III'],
    [951, 'War of the Dead'],
    [960, 'Snake It'],
    [964, 'Zoids: Chuuou Tairiku no Tatakai'],
    [967, 'Dynamite Bowl'],
    [969, 'Bishoujo Shashinkan Special: Double Vision'],
    [974, 'Digital Devil Monogatari: Megami Tensei'],
    [985, 'Ninja-Kid II'],
    [991, 'Hydlide 3'],
    [993, 'Vaxol: Heavy Armed Storming Vehicle'],
    [1002, 'Hi no Tori: Hōō-hen'],
    [1012, 'Project A 2: Shijō Saidai no Hyōteki'],
    [1014, 'Bōken Roman'],
    [1017, 'Higemaru Makaijima'],
    [1018, 'Makai Fukkatsu'],
    [1020, 'Mashō no Yakata Goblin'],
    [1025, 'Mirai'],
    [1043, 'Robo Wres 2001'],
    [1053, 'Arkanoid: Revenge of DOH'],
    [1056, 'Ankoku Shinwa: Yamato Takeru Densetsu'],
    [1057, 'Angelus: Akuma no Fukuin'],
    [1059, 'Ys II: Ancient Ys Vanished: The Final Chapter'],
    [1073, 'F-1 Spirit: 3D Special'],
    [1064, 'Wingman Special: Saraba Yume Senshi'],
    [1078, 'King\'s Valley 2'],
    [1079, 'King\'s Valley 2'],
    [1080, 'Elthlead Senshi'],
    [1083, 'Onryou Senki'],
    [1087, 'Casablanca ni Ai o: Satsujinsha wa Jikū o Koete'],
    [1094, 'Kimagure Orange Road: Natsu no Mirage'],
    [1112, 'Kohakuiro no Yuigon'],
    [1117, 'Cosmic Soldier 2: Psychic War'],
    [1119, 'Psychic World'],
    [1126, 'The Pro Yakyū Gekitotsu: Pennant Race'],
    [1135, 'War of the Dead Part 2'],
    [1136, 'Shin Ku Gyoku Den'],
    [1138, 'Shin Maō Golvellius'],
    [1157, 'Tsurikichi Sanpei: Blue Marlin Hen'],
    [1171, 'Dragon Warrior II'],
    [1185, 'Hadou no Hyouteki'],
    [1188, 'Parodius'],
    [1191, 'Victorious Nine II'],
    [1192, 'Bishoujo Shashinkan Part III: Photo Club - Kyoufu no Kan Hen'],
    [1239, 'Ys III: Wanderers from Ys'],
    [1240, 'Burai: Joken'],
    [1241, 'Rune Worth: Kokui no Kikoushi'],
    [1243, 'Xak: The Art of Visual Stage'],
    [1247, 'Pro Yakyuu Family Stadium: Pennant Race'],
    [1249, 'Fire Hawk: Thexder the Second Contact'],
    [1252, 'Valis II'],
    [1254, 'Nemesis 3: The Eve of Destruction'],
    [1257, 'Pro Yakyuu Family Stadium: Home Run Contest'],
    [1258, 'Mitsume ga Tooru'],
    [1259, 'Fantasy Zone II: The Tears of Opa-Opa'],
    [1262, 'Tashiro Masashi no Princess ga Ippai'],
    [1268, 'Digan no Maseki'],
    [1279, 'Laplace no Ma'],
    [1296, 'The 4th Unit 3 - Dual Targets'],
    [1318, 'Intruder: Sakura Yashiki no Tansaku'],
    [1319, 'Rance: Hikari o Motomete'],
    [1324, 'Master of Monsters'],
    [1331, 'Schwarzschild: Kyōran no Ginga'],
    [1367, 'Aleste Gaiden'],
    [1386, 'Xak II: Rising of The Redmoon'],
    [1387, 'Dragon Slayer: The Legend of Heroes'],
    [1390, 'Randar no Bouken III: Yami ni Miserareta Majutsushi'],
    [1391, 'Madou Monogatari 1-2-3'],
    [1460, 'Bishoujo Shashinkan Bangai-Hen: OutSide Story'],
    [1466, 'Cybernetic Hi-School'],
    [1482, 'Yakyuudou II'],
    [1500, 'Gaia no Monshou'],
    [1541, 'Ranma 1/2 Hiryuu Densetsu'],
    [1544, 'Illusion City - Gen\'ei Toshi'],
    [1545, 'Inindo: Way of the Ninja'],
    [1550, 'Xak: The Tower of Gazzel'],
    [1553, 'Himitsu no Hanazono'],
    [1559, 'Rance II: Hangyaku no Shoujotachi'],
    [1607, 'Gorby no Pipeline Daisakusen'],
    [1666, 'Action RPG Construction Tool: Dante 2'],
    [1701, 'Burai: Gekan Kanketsuhen'],
    [1703, 'Dead of the Brain: Shiryou no Sakebi'],
    [1707, 'The Tower? Of Cabin: Cabin Panic'],
    [1772, 'Mirai'],
    [1798, 'BC\'s Quest for Tires'],
    [1827, 'Topple Zip'],
    [1828, 'Fantasy Zone'],
    [1830, 'The 4th Unit 2'],
    [1831, 'Tanigawa Kouji no Shogi Shinan II'],
    [1835, 'Bandit Kings of Ancient China'],
    [1843, 'Jack Nicklaus\' Greatest 18 Holes of Major Championship Golf'],
    [2112, 'A.M.C.: Astro Marine Corps'],
    [2152, 'El Cid'],
    [2223, 'El Misterio del Nilo'],
    [2241, 'La Abadía del Crimen'],
    [2252, 'The Last Mission'],
    [2254, 'Livingstone, I Presume?'],
    [2277, 'Choy-Lee-Fut Kung-Fu Warrior'],
    [2295, 'Ale Hop!'],
    [2349, 'El Poder Oscuro'],
    [2394, 'MacAttack'],
    [2414, 'Who Dares Wins II'],
    [2448, 'World Karate Championship'],
    [2601, 'BC\'s Quest for Tires II: Grog\'s Revenge'],
    [2697, 'Boulder Dash'],
    [2833, 'Confused?'],
    [2911, 'The Activision Decathlon'],
    [3087, 'Top wo Nerae: Cybernetic High-School III'],
    [3107, 'Return to Eden'],
    [3169, 'Double Dragon II: The Revenge'],
    [3211, 'Dynamite Bowl'],
    [3217, 'The Light Corridor'],
    [3278, 'The Day II'],
    [3280, 'Agi Gongnyong Dooly'],
    [3602, 'Wonder Kid'],
    [3687, 'Universe: Unknown']
  ];

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
      return game.title.toString().replace(' - ', ': ');
    } else {
      return game.name;
    }
  }

  private initIdToName() {
    this.idsToNames.forEach(pair => {
      this.idToName.set(Number(pair[0]), pair[1].toString());
    });
  }
}
