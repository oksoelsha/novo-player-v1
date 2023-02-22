import { Game } from '../game';
import { Filter } from './filter';

export class CompanyFilter implements Filter {

    readonly company: string;

    constructor(company: string) {
        this.company = company;
    }

    isFiltered(game: Game): boolean {
        return game.company === this.company;
    }

    getIdentifier(): string {
        return this.company;
    }
}
