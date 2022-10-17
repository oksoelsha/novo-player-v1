import { Game } from '../game';
import { Filter } from './filter';

export class MachineFilter implements Filter {

    readonly machine: string;

    constructor(machine: string) {
        this.machine = machine;
    }

    isFiltered(game: Game): boolean {
        return game.machine === this.machine;
    }
}
