import { Game } from "../game";
import { Medium } from "../medium";
import { MediumFilter } from "./medium-filter";

describe('MediumFilter', () => {
  it('MediumFilter should be constructed correctly', () => {
    const filter = new MediumFilter(Medium.disk);
    expect(filter.medium).toEqual(Medium.disk);
  });
});

describe('MediumFilter', () => {
  it('MediumFilter should filter game with matching filter medium', () => {
    const filter = new MediumFilter(Medium.disk);
    const game = new Game('name', '123', 123);
    game.setDiskA('disk');
    expect(filter.isFiltered(game)).toBeTrue();
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
