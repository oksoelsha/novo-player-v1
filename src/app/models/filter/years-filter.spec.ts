import { ComparisonOperator } from "../comparison-operator";
import { FilterRange } from "../filters";
import { Game } from "../game";
import { YearsFilter } from "./years-filter";

describe('YearsFilter', () => {
  it('YearsFilter should be constructed correctly', () => {
    const years = new FilterRange(10, ComparisonOperator.betweenInclusive, 25);
    const filter = new YearsFilter(years);
    expect(filter.years.start).toEqual(10);
    expect(filter.years.comparisonOperator).toEqual(ComparisonOperator.betweenInclusive);
    expect(filter.years.end).toEqual(25);
  });
});

describe('YearsFilter', () => {
  it('YearsFilter should filter game with a size equal to a the filter equal', () => {
    const years = new FilterRange(1985, ComparisonOperator.equal, 0);
    const filter = new YearsFilter(years);
    const game1 = new Game('name', '123', 1);
    game1.setYear('1984');
    expect(filter.isFiltered(game1)).toBeFalse();
    const game2 = new Game('name', '123', 2);
    game2.setYear('1985');
    expect(filter.isFiltered(game2)).toBeTrue();
    const game3 = new Game('name', '123', 3);
    game3.setYear('1986');
    expect(filter.isFiltered(game3)).toBeFalse();
  });
});

describe('YearsFilter', () => {
  it('YearsFilter should filter game with a size less than a the filter less-than', () => {
    const years = new FilterRange(1986, ComparisonOperator.less, 0);
    const filter = new YearsFilter(years);
    const game1 = new Game('name', '123', 1);
    game1.setYear('1985');
    expect(filter.isFiltered(game1)).toBeTrue();
    const game2 = new Game('name', '123', 2);
    game2.setYear('1986');
    expect(filter.isFiltered(game2)).toBeFalse();
    const game3 = new Game('name', '123', 3);
    game3.setYear('1987');
    expect(filter.isFiltered(game3)).toBeFalse();
  });
});

describe('YearsFilter', () => {
  it('YearsFilter should filter game with a size equal to or less than a the filter less-than-equal', () => {
    const years = new FilterRange(1986, ComparisonOperator.lessOrEqual, 0);
    const filter = new YearsFilter(years);
    const game1 = new Game('name', '123', 1);
    game1.setYear('1985');
    expect(filter.isFiltered(game1)).toBeTrue();
    const game2 = new Game('name', '123', 2);
    game2.setYear('1986');
    expect(filter.isFiltered(game2)).toBeTrue();
    const game3 = new Game('name', '123', 3);
    game3.setYear('1987');
    expect(filter.isFiltered(game3)).toBeFalse();
  });
});

describe('YearsFilter', () => {
  it('YearsFilter should filter game with a size greater than a the filter greater-than', () => {
    const years = new FilterRange(1986, ComparisonOperator.greater, 0);
    const filter = new YearsFilter(years);
    const game1 = new Game('name', '123', 1);
    game1.setYear('1985');
    expect(filter.isFiltered(game1)).toBeFalse();
    const game2 = new Game('name', '123', 2);
    game2.setYear('1986');
    expect(filter.isFiltered(game2)).toBeFalse();
    const game3 = new Game('name', '123', 3);
    game3.setYear('1987');
    expect(filter.isFiltered(game3)).toBeTrue();
  });
});

describe('YearsFilter', () => {
  it('YearsFilter should filter game with a size equal to or greater than a the filter greater-than-equal', () => {
    const years = new FilterRange(1986, ComparisonOperator.greaterOrEqual, 0);
    const filter = new YearsFilter(years);
    const game1 = new Game('name', '123', 1);
    game1.setYear('1985');
    expect(filter.isFiltered(game1)).toBeFalse();
    const game2 = new Game('name', '123', 2);
    game2.setYear('1986');
    expect(filter.isFiltered(game2)).toBeTrue();
    const game3 = new Game('name', '123', 3);
    game3.setYear('1987');
    expect(filter.isFiltered(game3)).toBeTrue();
  });
});

describe('YearsFilter', () => {
  it('YearsFilter should filter game with a size inbetween inclusive a the filter inbetween-inclusive', () => {
    const years = new FilterRange(1988, ComparisonOperator.betweenInclusive, 1990);
    const filter = new YearsFilter(years);
    const game1 = new Game('name', '123', 1);
    game1.setYear('1987');
    expect(filter.isFiltered(game1)).toBeFalse();
    const game2 = new Game('name', '123', 2);
    game2.setYear('1988');
    expect(filter.isFiltered(game2)).toBeTrue();
    const game3 = new Game('name', '123', 3);
    game3.setYear('1989');
    expect(filter.isFiltered(game3)).toBeTrue();
    const game4 = new Game('name', '123', 4);
    game4.setYear('1990');
    expect(filter.isFiltered(game4)).toBeTrue();
    const game5 = new Game('name', '123', 5);
    game5.setYear('1991');
    expect(filter.isFiltered(game5)).toBeFalse();
  });
});
