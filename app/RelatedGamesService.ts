import { BrowserWindow, ipcMain } from 'electron'
import { ExtraData, ExtraDataService } from './ExtraDataService'
import { EmulatorRepositoryService, RepositoryData } from './EmulatorRepositoryService'
import { Game } from '../src/app/models/game'
import { GameUtils } from '../src/app/models/game-utils';
import { GamesService } from './GamesService';

export class RelatedGamesService {
    private extraDataInfo: Map<string, ExtraData>;
    private repositoryInfo: Map<string, RepositoryData>;

    private readonly excludedStrings = new Set<string>();
    private readonly idToCluster = new Map<number, Set<number>>();
    private readonly wordSynonyms = new Map<string, Set<string>>();
    private readonly NAME_MATCH_ONE_WORD_GAME_SCORE = 5;
    private readonly NAME_MATCH_ONE_IN_MANY_WORDS_SCORE = 3;
    private readonly NAME_MATCH_TWO_OR_MORE_IN_MANY_WORDS_SCORE = 5;

    private readonly GENRE_NON_ACTION_MATCH_SCORE = 4;
    private readonly GENRE_ACTION_MATCH_SCORE = 3;
    private readonly GENRE_SECOND_MATCH_SCORE = 1;

    private readonly COMPANY_MATCH_SCORE = 2;
    private readonly SAME_CLUSTER_MATCH_SCORE = 7;
    private readonly MAX_SIZE_RESULTS = 30;

    private readonly ACTION_GENRE_CODE = GameUtils.getGenreCode('Action');

    constructor(
        private win: BrowserWindow,
        private extraDataService: ExtraDataService,
        private emulatorRepositoryService: EmulatorRepositoryService,
        private gamesService: GamesService) {

        this.extraDataInfo = extraDataService.getExtraDataInfo();
        this.repositoryInfo = emulatorRepositoryService.getRepositoryInfo();
        this.init();
    }

    private init() {
        this.initExcludedStrings();
        this.initIdToCluster();
        this.initWordToSynonyms();

        ipcMain.on('findRelatedGames', (event: any, game: Game) => {
            this.findRelated(game);
        });
    }

    private initExcludedStrings() {
        this.excludedStrings.add('-');
        this.excludedStrings.add('i');
        this.excludedStrings.add('ii');
        this.excludedStrings.add('the');
        this.excludedStrings.add('of');
        this.excludedStrings.add('and');
        this.excludedStrings.add('in');
        this.excludedStrings.add('on');
        this.excludedStrings.add('at');
        this.excludedStrings.add('to');
        this.excludedStrings.add('for');
        this.excludedStrings.add('version');
        this.excludedStrings.add('de');
        this.excludedStrings.add('del');
        this.excludedStrings.add('el');
        this.excludedStrings.add('la');
        this.excludedStrings.add('los');
        this.excludedStrings.add('las');
        this.excludedStrings.add('en');
        this.excludedStrings.add('y');
        this.excludedStrings.add('&');
    }

    private initIdToCluster() {
        const groups: number[][] = [
            // Gradius series
            [742, 932, 1254, 941, 1188],

            // Knightmare series and Pampas & Selene
            [855, 916, 946, 7989],

            // Space Manbow and Manbow 2
            [1238, 3607],

            // Road fighter and Car Fighter
            [684, 412],

            // Knightlore and Knightlore Remake
            [810, 4221],

            // Street Fighter and Pointless Fighting
            [7496, 7878],

            // Green Beret and S.A.K.
            [3091, 8100],

            // Galaga and Galaxian
            [141, 142],

            // Q-Berts
            [739, 2440, 2990, 8717],

            // Commando style (T.N.T, Who Dares Wins, etc.)
            [778, 838, 2414, 3148, 5437, 7011],

            // Frogger, Hopper, etc.
            [70, 2390, 2720, 3442]
        ];

        groups.forEach((group) => {
            const groupSet = new Set<number>(group);
            group.forEach((id) => {
                this.idToCluster.set(id, groupSet);
            });
        });
    }

    private initWordToSynonyms() {
        const groups: string[][] = [
            ['soccer', 'football', 'fútbol', 'futbol'],
            ['dunk', 'basketball'],
            ['tennis', 'tenis'],
            ['viper', 'gusano'],
            ['mystery', 'misterio']
        ];

        groups.forEach((group) => {
            const groupSet = new Set<string>(group);
            group.forEach((name) => {
                this.wordSynonyms.set(name, groupSet);
            });
        });
    }

    private async findRelated(game: Game) {
        const similarGames = new Map<number, SimilarGame>();

        const repositoryGame = this.repositoryInfo.get(game.sha1Code);
        let companyOfSelectedGame: string;
        let gameNameParts: Set<string>[] = [];
        if (!repositoryGame) {
            companyOfSelectedGame = '';
            gameNameParts = this.getNormalizedStringsWithSynonyms(game.name);
        } else {
            companyOfSelectedGame = repositoryGame.softwareData.company;
            gameNameParts = this.getNormalizedStringsWithSynonyms(repositoryGame.softwareData.title);
        }
        const clusterForGivenGame = this.idToCluster.get(game.generationMSXId);

        for (let entry of Array.from(this.repositoryInfo.entries())) {
            const sha1 = entry[0];
            const repositoryInfo = entry[1];

            // limit the results to MSX system only (i.e. exclude others such as ColecoVision)
            if (repositoryInfo.softwareData.system?.startsWith('MSX')) {
                const extraDataInfo = this.extraDataInfo.get(sha1);
                if (extraDataInfo != null) {
                    const similarGame = similarGames.get(extraDataInfo.generationMSXID);

                    if (similarGame) {
                        if (!similarGame.relatedGame.listing) {
                            const listing = await this.gamesService.getListing(sha1);
                            if (listing) {
                                const updatedGame = new Game(similarGame.relatedGame.name, sha1, 0);
                                updatedGame.setGenerationMSXId(similarGame.relatedGame.generationMSXId);
                                updatedGame.setCompany(similarGame.relatedGame.company);
                                updatedGame.setYear(similarGame.relatedGame.year);
                                updatedGame.setScreenshotSuffix(similarGame.relatedGame.screenshotSuffix);
                                updatedGame.setListing(listing);

                                similarGames.set(extraDataInfo.generationMSXID, similarGame.clone(updatedGame));
                            }
                        }
                    } else {
                        if (extraDataInfo.generationMSXID != game.generationMSXId) {
                            const repositoryCompany = repositoryInfo.softwareData.company;
                            const repositoryTitle = repositoryInfo.softwareData.title;

                            const score = this.getNameScore(repositoryTitle, gameNameParts) +
                                this.getGenreScore(extraDataInfo, game) +
                                this.getCompanyScore(repositoryCompany, companyOfSelectedGame) +
                                this.getClusterScore(clusterForGivenGame, extraDataInfo.generationMSXID);

                            if (score > 0) {
                                const relatedGame = new Game(repositoryTitle, sha1, 0);
                                relatedGame.setGenerationMSXId(extraDataInfo.generationMSXID);
                                relatedGame.setCompany(repositoryCompany);
                                relatedGame.setYear(repositoryInfo.softwareData.year);
                                relatedGame.setScreenshotSuffix(extraDataInfo.suffix);

                                const listing = await this.gamesService.getListing(sha1);
                                relatedGame.setListing(listing);

                                const similarGame = new SimilarGame(relatedGame, score);
                                similarGames.set(similarGame.relatedGame.generationMSXId, similarGame);
                            }
                        }
                    }
                }
            }
        }

        const relatedGames = Array.from(similarGames.values())
            .sort((a, b) => b.score - a.score)
            .map((s) => s.relatedGame)
            .slice(0, this.MAX_SIZE_RESULTS);

        this.win.webContents.send('findRelatedGamesResponse', relatedGames);
    }

    private getNameScore(title: string, gameNamePartSets: Set<string>[]): number {
        const repositoryTitleParts = this.getNormalizedStrings(title);
        let score = 0;
        let matches = 0;
        gameNamePartSets.forEach((partSet) => {
            partSet.forEach((part) => {
                if (repositoryTitleParts.has(part)) {
                    if (repositoryTitleParts.size === 1 || gameNamePartSets.length === 1) {
                        score = score + this.NAME_MATCH_ONE_WORD_GAME_SCORE;
                    } else {
                        matches++;
                        score = score + ((matches === 1)
                            ? this.NAME_MATCH_ONE_IN_MANY_WORDS_SCORE : this.NAME_MATCH_TWO_OR_MORE_IN_MANY_WORDS_SCORE);
                    }
                }
            })
        });
        return score;
    }

    private getGenreScore(extraData: ExtraData, game: Game): number {
        let score = 0;
        if (extraData) {
            const selectedGameGenre1 = game.genre1;
            const selectedGameGenre2 = game.genre2;
            const genre1OfRepositoryGame = extraData.genre1;
            const genre2OfRepositoryGame = extraData.genre2;
            let firstMatch = false;

            if (selectedGameGenre1 !== 0) {
                if (selectedGameGenre1 == genre1OfRepositoryGame || selectedGameGenre1 == genre2OfRepositoryGame) {
                    if (selectedGameGenre1 === this.ACTION_GENRE_CODE) {
                        score = score + this.GENRE_ACTION_MATCH_SCORE;
                    } else {
                        score = score + this.GENRE_NON_ACTION_MATCH_SCORE;
                    }
                    firstMatch = true;
                }
            }
            if (selectedGameGenre2 !== 0) {
                if (selectedGameGenre2 == genre1OfRepositoryGame || selectedGameGenre2 == genre2OfRepositoryGame) {
                    if (firstMatch) {
                        score = score + this.GENRE_SECOND_MATCH_SCORE;
                    } else {
                        if (selectedGameGenre2 === this.ACTION_GENRE_CODE) {
                            score = score + this.GENRE_ACTION_MATCH_SCORE;
                        } else {
                            score = score + this.GENRE_NON_ACTION_MATCH_SCORE;
                        }
                    }
                }
            }
        }

        return score;
    }

    private getCompanyScore(companyOfRepositoryGame: string, companyOfSelectedGame: string): number {
        if (companyOfRepositoryGame && companyOfRepositoryGame == companyOfSelectedGame) {
            return this.COMPANY_MATCH_SCORE;
        } else {
            return 0;
        }
    }

    private getClusterScore(clusterForGivenGame: Set<number>, extraDataGenMSXId: number): number {
        if (clusterForGivenGame != null && clusterForGivenGame.has(extraDataGenMSXId)) {
            return this.SAME_CLUSTER_MATCH_SCORE;
        } else {
            return 0;
        }
    }

    private getNormalizedStringsWithSynonyms(str: string): Set<string>[] {
        const parts = (str + '').split(' ');

        return parts.map((s) => s.toLowerCase())
            .map((s) => s.replace(',', ''))
            .filter((s) => !this.excludedStrings.has(s))
            .filter((s) => !(this.isNumber(s) && this.getNumber(s) < 5))
            .map((s) => this.getSynonyms(s));
    }

    private getNormalizedStrings(str: string): Set<string> {
        const parts = (str + '').split(' ');

        return new Set<string>(parts.map((s) => s.toLowerCase())
            .map((s) => s.replace(',', ''))
            .filter((s) => !this.excludedStrings.has(s))
            .filter((s) => !(this.isNumber(s) && this.getNumber(s) < 5)));
    }

    private getSynonyms(word: string): Set<string> {
        let synonyms = this.wordSynonyms.get(word);
        if (!synonyms) {
            synonyms = new Set<string>([word]);
        }
        return synonyms;        
    }

    private isNumber(str: string): boolean {
        return !isNaN(+str);
    }

    private getNumber(str: string): number {
        return +str;
    }
}

class SimilarGame {
    relatedGame: Game;
    score: number;

    constructor(relatedGame: Game, score: number) {
        this.relatedGame = relatedGame;
        this.score = score;
    }

    clone(relatedGame: Game) {
        return new SimilarGame(relatedGame, this.score);
    }
}
