import { Game } from '../game';
import { FDDModeFilter } from './fddmode-filter';

describe('FDDModeFilter', () => {
  it('FDDModeFilter should be constructed correctly', () => {
    const filter = new FDDModeFilter(2);
    expect(filter.fddMode).toEqual(2);
  });
});

describe('FDDModeFilter', () => {
  it('FDDModeFilter should filter game with matching filter FDD mode', () => {
    const filter = new FDDModeFilter(2);
    const game = new Game('name', '123', 123);
    game.setFddMode(2);
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('FDDModeFilter', () => {
  it('FDDModeFilter should not filter game with non matching filter FDD mode', () => {
    const filter = new FDDModeFilter(2);
    const game = new Game('name', '123', 123);
    game.setFddMode(3);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('FDDModeFilter', () => {
  it('FDDModeFilter should not filter game with no FDD mode set and game with non-default FDD mode', () => {
    const filter = new FDDModeFilter(2);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('FDDModeFilter', () => {
  it('FDDModeFilter should filter game with no FDD mode set and game with default FDD mode', () => {
    const filter = new FDDModeFilter(0);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('FDDModeFilter', () => {
  it('FDDModeFilter should return correct identifier', () => {
    const filter = new FDDModeFilter(1);
    expect(filter.getIdentifier()).toEqual('1');
  });
});
