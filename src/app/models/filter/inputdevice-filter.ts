import { Game } from '../game';
import { Filter } from './filter';

export class InputDeviceFilter implements Filter {

    readonly inputDevice: number;

    constructor(inputDevice: number) {
        this.inputDevice = inputDevice;
    }

    isFiltered(game: Game): boolean {
        return (!game.inputDevice && this.inputDevice === 0) || game.inputDevice === this.inputDevice;
    }
}
