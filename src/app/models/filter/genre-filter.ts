import { Game } from '../game';
import { Filter } from './filter';

export class GenreFilter implements Filter {

    readonly genre: number;

    constructor(genre: number) {
        this.genre = genre;
    }

    isFiltered(game: Game): boolean {
        return game.genre1 === this.genre || game.genre2 === this.genre;
    }

    getIdentifier(): string {
        return this.genre.toString();
    }
}
