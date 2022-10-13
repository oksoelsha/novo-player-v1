import { Game } from '../game';
import { Filter } from './filter';

export class SoundFilter implements Filter {

    readonly sound: number;

    constructor(sound: number) {
        this.sound = sound;
    }

    isFiltered(game: Game): boolean {
        return (game.sounds & this.sound) > 0;
    }
}
