import { Game } from '../game';

export interface Filter {
    isFiltered(game: Game): boolean;
}
