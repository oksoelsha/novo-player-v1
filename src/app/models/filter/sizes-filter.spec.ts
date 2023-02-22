import { ComparisonOperator } from '../comparison-operator';
import { FilterRange } from '../filters';
import { Game } from '../game';
import { SizesFilter } from './sizes-filter';

describe('SizesFilter', () => {
  it('SizesFilter should be constructed correctly', () => {
    const sizes = new FilterRange(10, ComparisonOperator.betweenInclusive, 25);
    const filter = new SizesFilter(sizes);
    expect(filter.sizes.start).toEqual(10);
    expect(filter.sizes.comparisonOperator).toEqual(ComparisonOperator.betweenInclusive);
    expect(filter.sizes.end).toEqual(25);
  });
});

describe('SizesFilter', () => {
  it('SizesFilter should filter game with a size equal to a the filter equal', () => {
    const sizes = new FilterRange(10, ComparisonOperator.equal, 0);
    const filter = new SizesFilter(sizes);
    const game1 = new Game('name', '123', 9);
    expect(filter.isFiltered(game1)).toBeFalse();
    const game2 = new Game('name', '123', 10);
    expect(filter.isFiltered(game2)).toBeTrue();
    const game3 = new Game('name', '123', 11);
    expect(filter.isFiltered(game3)).toBeFalse();
  });
});

describe('SizesFilter', () => {
  it('SizesFilter should filter game with a size less than a the filter less-than', () => {
    const sizes = new FilterRange(10, ComparisonOperator.less, 0);
    const filter = new SizesFilter(sizes);
    const game1 = new Game('name', '123', 9);
    expect(filter.isFiltered(game1)).toBeTrue();
    const game2 = new Game('name', '123', 10);
    expect(filter.isFiltered(game2)).toBeFalse();
    const game3 = new Game('name', '123', 11);
    expect(filter.isFiltered(game3)).toBeFalse();
  });
});

describe('SizesFilter', () => {
  it('SizesFilter should filter game with a size equal to or less than a the filter less-than-equal', () => {
    const sizes = new FilterRange(10, ComparisonOperator.lessOrEqual, 0);
    const filter = new SizesFilter(sizes);
    const game1 = new Game('name', '123', 9);
    expect(filter.isFiltered(game1)).toBeTrue();
    const game2 = new Game('name', '123', 10);
    expect(filter.isFiltered(game2)).toBeTrue();
    const game3 = new Game('name', '123', 11);
    expect(filter.isFiltered(game3)).toBeFalse();
  });
});

describe('SizesFilter', () => {
  it('SizesFilter should filter game with a size greater than a the filter greater-than', () => {
    const sizes = new FilterRange(10, ComparisonOperator.greater, 0);
    const filter = new SizesFilter(sizes);
    const game1 = new Game('name', '123', 9);
    expect(filter.isFiltered(game1)).toBeFalse();
    const game2 = new Game('name', '123', 10);
    expect(filter.isFiltered(game2)).toBeFalse();
    const game3 = new Game('name', '123', 11);
    expect(filter.isFiltered(game3)).toBeTrue();
  });
});

describe('SizesFilter', () => {
  it('SizesFilter should filter game with a size equal to or greater than a the filter greater-than-equal', () => {
    const sizes = new FilterRange(10, ComparisonOperator.greaterOrEqual, 0);
    const filter = new SizesFilter(sizes);
    const game1 = new Game('name', '123', 9);
    expect(filter.isFiltered(game1)).toBeFalse();
    const game2 = new Game('name', '123', 10);
    expect(filter.isFiltered(game2)).toBeTrue();
    const game3 = new Game('name', '123', 11);
    expect(filter.isFiltered(game3)).toBeTrue();
  });
});

describe('SizesFilter', () => {
  it('SizesFilter should filter game with a size inbetween inclusive a the filter inbetween-inclusive', () => {
    const sizes = new FilterRange(10, ComparisonOperator.betweenInclusive, 12);
    const filter = new SizesFilter(sizes);
    const game1 = new Game('name', '123', 9);
    expect(filter.isFiltered(game1)).toBeFalse();
    const game2 = new Game('name', '123', 10);
    expect(filter.isFiltered(game2)).toBeTrue();
    const game3 = new Game('name', '123', 11);
    expect(filter.isFiltered(game3)).toBeTrue();
    const game4 = new Game('name', '123', 12);
    expect(filter.isFiltered(game4)).toBeTrue();
    const game5 = new Game('name', '123', 13);
    expect(filter.isFiltered(game5)).toBeFalse();
  });
});

describe('SizesFilter', () => {
  it('SizesFilter should return correct identifier', () => {
    const sizes = new FilterRange(15, ComparisonOperator.betweenInclusive, 35);
    const filter = new SizesFilter(sizes);
    expect(filter.getIdentifier()).toEqual('15-betweenInclusive');
  });
});
