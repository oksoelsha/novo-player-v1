import { BrowserWindow, ipcMain } from 'electron'
import { ExtraData, ExtraDataService } from './ExtraDataService'
import { EmulatorRepositoryService, RepositoryData } from './EmulatorRepositoryService'
import { Game } from '../src/app/models/game'
import { RelatedGame } from '../src/app/models/related-game'

export class RelatedGamesService {
    private extraDataInfo: Map<string, ExtraData>;
    private repositoryInfo: Map<string, RepositoryData>;

    private readonly excludedStrings = new Set<string>();
    private readonly idToCluster = new Map<number,Set<number>>();
    private readonly NAME_MATCH_ONE_WORD_GAME_SCORE = 5;
    private readonly NAME_MATCH_ONE_IN_MANY_WORDS_SCORE = 3;
    private readonly NAME_MATCH_TWO_OR_MORE_IN_MANY_WORDS_SCORE = 5;
    private readonly GENRE_MATCH_SCORE = 4;
    private readonly COMPANY_MATCH_SCORE = 2;
    private readonly SAME_CLUSTER_MATCH_SCORE = 7;
    private readonly MAX_SIZE_RESULTS = 30;

    constructor(
        private win: BrowserWindow,
        private extraDataService: ExtraDataService,
        private emulatorRepositoryService: EmulatorRepositoryService) {

        this.extraDataInfo = extraDataService.getExtraDataInfo();
        this.repositoryInfo = emulatorRepositoryService.getRepositoryInfo();
        this.init();
    }

    private init() {
        this.initExcludedStrings();
        this.initIdToCluster();

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
		this.excludedStrings.add('version');
		this.excludedStrings.add('de');
		this.excludedStrings.add('el');
		this.excludedStrings.add('los');
		this.excludedStrings.add('en');
    }

    private initIdToCluster() {
        const groups: number[][] = [
            // Gradius series
            [742, 932, 1254, 941, 1188],

            // Knightmare series
            [855, 916, 946],

            // Space Manbow and Manbow 2
            [1238, 3607],

            // Road fighter and Car Fighter
            [684, 412],

            // Knightlore and Knightlore Remake
            [810, 4221]
        ];

        groups.forEach((group) => {
            const groupSet = new Set<number>(group);
            group.forEach((id) => {
                this.idToCluster.set(id, groupSet);
            });
        });
    }

    private findRelated(game: Game) {
        const similarGames = new Map<number, SimilarGame>();

        const repositoryGame = this.repositoryInfo.get(game.sha1Code);
        let companyOfSelectedGame: string;
        let gameNameParts: Set<string>;
        if (!repositoryGame) {
            companyOfSelectedGame = '';
            gameNameParts = this.getNormalizedStrings(game.name);
        } else {
            companyOfSelectedGame = repositoryGame.company;
            gameNameParts = this.getNormalizedStrings(repositoryGame.title);
        }
        const clusterForGivenGame = this.idToCluster.get(game.generationMSXId);

        this.repositoryInfo.forEach((entry: RepositoryData, sha1: string) => {
            // limit the results to MSX system only (i.e. exclude others such as ColecoVision)
            if (entry.system === 'MSX') {
                const companyOfRepositoryGame = entry.company;
                const repositoryTitle = entry.title;
                const extraData = this.extraDataInfo.get(sha1);

                if (extraData != null && extraData.generationMSXID != game.generationMSXId) {
                    const score = this.getNameScore(repositoryTitle, gameNameParts) +
                        this.getGenreScore(extraData, game) +
                        this.getCompanyScore(companyOfRepositoryGame, companyOfSelectedGame) +
                        this.getClusterScore(clusterForGivenGame, extraData.generationMSXID);

                    if (score > 0) {
                        const similarGame = new SimilarGame(new RelatedGame(repositoryTitle, entry.company,
                            entry.year, extraData.generationMSXID), score);
                        similarGames.set(similarGame.relatedGame.generationMSXId, similarGame);
                    }
                }
            }
        });

        const relatedGames = Array.from(similarGames.values())
            .sort((a, b) => (a.score < b.score ? 1 : -1))
            .map((s) => s.relatedGame)
            .slice(0, this.MAX_SIZE_RESULTS);
        this.win.webContents.send('findRelatedGamesResponse', relatedGames);
    }

    private getNameScore(title: string, gameNameParts: Set<string>): number {
        const repositoryTitleParts = this.getNormalizedStrings(title);
        let score = 0;
        let matches = 0;
        gameNameParts.forEach((part) => {
            if (repositoryTitleParts.has(part)) {
                if (repositoryTitleParts.size == 1 || gameNameParts.size == 1) {
                    score = score + this.NAME_MATCH_ONE_WORD_GAME_SCORE;
                } else {
                    matches++;
                    score = score + ((matches == 1)
                        ? this.NAME_MATCH_ONE_IN_MANY_WORDS_SCORE : this.NAME_MATCH_TWO_OR_MORE_IN_MANY_WORDS_SCORE);
                }
            }
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

			if ((selectedGameGenre1 != 0 && (selectedGameGenre1 == genre1OfRepositoryGame || selectedGameGenre1 == genre2OfRepositoryGame)) ||
					(selectedGameGenre2 != 0 && (selectedGameGenre2 == genre1OfRepositoryGame || selectedGameGenre2 == genre2OfRepositoryGame )) ) {
				score = this.GENRE_MATCH_SCORE;
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

    private getNormalizedStrings(str: string): Set<string> {
        const parts = (str + '').split(' ');

        return new Set<string>(parts.map((s) => s.toLowerCase())
            .map((s) => s.replace(',', ''))
            .filter((s) => !this.excludedStrings.has(s))
            .filter((s) => !(this.isNumber(s) && this.getNumber(s) < 5)));
    }

    private isNumber(str: string): boolean {
        return !isNaN(+str);
    }

    private getNumber(str: string): number {
        return +str;
    }
}

class SimilarGame {
    relatedGame: RelatedGame;
    score: number;

    constructor(relatedGame: RelatedGame, score: number) {
        this.relatedGame = relatedGame;
        this.score = score;
    }
}
