import { Game } from '../game';
import { Filter } from './filter';

export class VideoSourceFilter implements Filter {

    readonly checkGFX9000: boolean;

    constructor(checkGFX9000: boolean) {
        this.checkGFX9000 = checkGFX9000;
    }

    isFiltered(game: Game): boolean {
        return (!this.checkGFX9000 && !game.connectGFX9000) || (this.checkGFX9000 && game.connectGFX9000);
    }

    getIdentifier(): string {
        return this.checkGFX9000? 't' : 'f';
    }
}
