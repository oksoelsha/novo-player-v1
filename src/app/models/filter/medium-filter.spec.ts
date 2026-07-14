import { Game } from '../game';
import { Medium } from '../medium';
import { MediumFilter } from './medium-filter';

describe('MediumFilter', () => {
  it('MediumFilter should be constructed correctly', () => {
    const filter = new MediumFilter(Medium.disk);
    expect(filter.medium).toEqual(Medium.disk);
  });
});

describe('MediumFilter', () => {
  it('MediumFilter should filter game with matching filter medium', () => {
    const filter1 = new MediumFilter(Medium.disk);

    const game1 = new Game('name', '123', 123);
    game1.setDiskA('disk');
    expect(filter1.isFiltered(game1)).toBeTrue();

    const filter2 = new MediumFilter(Medium.rom);

    const game2 = new Game('name', '123', 123);
    game2.setRomA('rom');
    expect(filter2.isFiltered(game2)).toBeTrue();

    const game3 = new Game('name', '123', 123);
    game3.setRomB('rom');
    expect(filter2.isFiltered(game3)).toBeTrue();
  });
});

describe('MediumFilter', () => {
  it('MediumFilter should not filter game with non matching filter medium', () => {
    const filter = new MediumFilter(Medium.laserdisc);
    const game = new Game('name', '123', 123);
    game.setTape('tape');
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('MediumFilter', () => {
  it('MediumFilter should not filter game with no medium (which is impossible)', () => {
    const filter = new MediumFilter(Medium.rom);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('MediumFilter', () => {
  it('MediumFilter should return correct identifier', () => {
    const filter = new MediumFilter(Medium.harddisk);
    expect(filter.getIdentifier()).toEqual(Medium.harddisk);
  });
});
