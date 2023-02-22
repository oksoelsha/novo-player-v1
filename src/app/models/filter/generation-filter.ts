import { Game } from '../game';
import { Generation } from '../generation';
import { Filter } from './filter';

export class GenerationFilter implements Filter {

    readonly generation: Generation;

    constructor(generation: Generation) {
        this.generation = generation;
    }

    isFiltered(game: Game): boolean {
        if (this.generation === Generation.MSX) {
            return (game.generations & 1) > 0;
        } else if (this.generation === Generation.MSX2) {
            return (game.generations & 2) > 0;
        } else if (this.generation === Generation.MSX2P) {
            return (game.generations & 4) > 0;
        } else if (this.generation === Generation.MSXTR) {
            return (game.generations & 8) > 0;
        } else {
            return true;
        }
    }

    getIdentifier(): string {
        return this.generation;
    }
}
