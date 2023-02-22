import { ComparisonOperator } from '../comparison-operator';
import { FilterRange } from '../filters';
import { Game } from '../game';
import { Filter } from './filter';

export class YearsFilter implements Filter {

    readonly years: FilterRange;

    constructor(years: FilterRange) {
        this.years = years;
    }

    isFiltered(game: Game): boolean {
        switch (this.years.comparisonOperator) {
            case ComparisonOperator.equal: {
                return +game.year === this.years.start;
            }
            case ComparisonOperator.less: {
                return +game.year < this.years.start;
            }
            case ComparisonOperator.lessOrEqual: {
                return +game.year <= this.years.start;
            }
            case ComparisonOperator.greater: {
                return +game.year > this.years.start;
            }
            case ComparisonOperator.greaterOrEqual: {
                return +game.year >= this.years.start;
            }
            case ComparisonOperator.betweenInclusive: {
                return +game.year >= this.years.start && +game.year <= this.years.end;
            }
            default: {
                return true;
            }
        }
    }

    getIdentifier(): string {
        return this.years.start.toString() + '-' + this.years.comparisonOperator;
    }
}
