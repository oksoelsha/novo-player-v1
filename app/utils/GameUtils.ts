import { Game } from "../../src/app/models/game";

export class GameUtils {

    static getGameMainFile(game: Game): string {
        if (game.romA != null) {
            return game.romA;
        } else if (game.diskA != null) {
            return game.diskA;
        } else if (game.tape != null) {
            return game.tape;
        } else if (game.harddisk != null) {
            return game.harddisk;
        } else if (game.laserdisc != null) {
            return game.laserdisc;
        } else {
            return '';
        }
    }

    static getMonikor(game: Game): any {
        return {name: game.name, listing: game.listing, sha1: game.sha1Code};
    }
}
