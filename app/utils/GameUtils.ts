import { Game } from '../../src/app/models/game';

export class GameUtils {

    static getGameMainFile(game: Game): string {
        if (game.romA) {
            return game.romA;
        } else if (game.diskA) {
            return game.diskA;
        } else if (game.tape) {
            return game.tape;
        } else if (game.harddisk) {
            return game.harddisk;
        } else if (game.laserdisc) {
            return game.laserdisc;
        } else {
            return '';
        }
    }

    static getMonikor(game: Game): any {
        return {name: game.name, listing: game.listing, sha1: game.sha1Code};
    }
}
