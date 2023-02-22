import { ComparisonOperator } from '../comparison-operator';
import { FilterRange } from '../filters';
import { Game } from '../game';
import { Filter } from './filter';

export class SizesFilter implements Filter {

    readonly sizes: FilterRange;

    constructor(sizes: FilterRange) {
        this.sizes = sizes;
    }

    isFiltered(game: Game): boolean {
        switch (this.sizes.comparisonOperator) {
            case ComparisonOperator.equal: {
                return game.size === this.sizes.start;
            }
            case ComparisonOperator.less: {
                return game.size < this.sizes.start;
            }
            case ComparisonOperator.lessOrEqual: {
                return game.size <= this.sizes.start;
            }
            case ComparisonOperator.greater: {
                return game.size > this.sizes.start;
            }
            case ComparisonOperator.greaterOrEqual: {
                return game.size >= this.sizes.start;
            }
            case ComparisonOperator.betweenInclusive: {
                return game.size >= this.sizes.start && game.size <= this.sizes.end;
            }
            default: {
                return true;
            }
        }
    }

    getIdentifier(): string {
        return this.sizes.start.toString() + '-' + this.sizes.comparisonOperator;
    }
}
