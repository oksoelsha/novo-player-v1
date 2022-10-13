import { ComparisonOperator } from './comparison-operator';
import { Filter } from './filter/filter';

export class FilterRange {
    readonly start: number;
    readonly comparisonOperator: ComparisonOperator;
    readonly end: number;

    constructor(start: number, comparisonOperator: ComparisonOperator, end: number) {
        this.start = start;
        this.comparisonOperator = comparisonOperator;
        this.end = end;
    }
}

export class Filters {
    readonly filters: Filter[][] = [];

    addFilter(filter: Filter) {
        let index = 0;
        let done = false;
        while (!done && index < this.filters.length) {
            if (this.filters[index][0].constructor === filter.constructor) {
                done = true;
            } else {
                index++;
            }
        }
        if (!this.filters[index]) {
            this.filters[index] = [];
        }
        this.filters[index].push(filter);
    }

    removeFilter(filter: Filter) {
        let differentTypesIndex = 0;
        let done = false;
        while (!done && differentTypesIndex < this.filters.length) {
            let sameTypeIndex = 0;
            while (!done && sameTypeIndex < this.filters[differentTypesIndex].length) {
                if (this.filters[differentTypesIndex][sameTypeIndex] === filter) {
                    this.filters[differentTypesIndex].splice(sameTypeIndex, 1);
                    if (this.filters[differentTypesIndex].length === 0) {
                        // Remove the empty array from the outer array
                        this.filters.splice(differentTypesIndex, 1);
                    }
                    done = true;
                } else {
                    sameTypeIndex++;
                }
            }
            differentTypesIndex++;
        }
    }
}
