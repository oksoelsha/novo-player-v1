import { Game } from '../game';
import { Filter } from './filter';

export class FDDModeFilter implements Filter {

    readonly fddMode: number;

    constructor(fddMode: number) {
        this.fddMode = fddMode;
    }

    isFiltered(game: Game): boolean {
        return (!game.fddMode && this.fddMode === 0) || game.fddMode === this.fddMode;
    }
}
