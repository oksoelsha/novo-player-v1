import { Game } from '../game';
import { Filter } from './filter';

export class CountryFilter implements Filter {

    readonly country: string;

    constructor(country: string) {
        this.country = country;
    }

    isFiltered(game: Game): boolean {
        return game.country === this.country;
    }
}
