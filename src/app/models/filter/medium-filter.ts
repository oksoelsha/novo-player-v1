import { Game } from '../game';
import { Medium } from '../medium';
import { Filter } from './filter';

export class MediumFilter implements Filter {

    readonly medium: string;

    constructor(medium: string) {
        this.medium = medium;
    }

    isFiltered(game: Game): boolean {
        if (game.romA != null) {
          return this.medium === Medium.rom;
        } else if (game.diskA != null) {
          return this.medium === Medium.disk;
        } else if (game.tape != null) {
            return this.medium === Medium.tape;
        } else if (game.harddisk != null) {
            return this.medium === Medium.harddisk;
        } else if (game.laserdisc != null) {
            return this.medium === Medium.laserdisc;
        }
        return false;
    }
}
