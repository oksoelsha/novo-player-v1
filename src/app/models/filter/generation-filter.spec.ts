import { Game } from '../game';
import { Generation } from '../generation';
import { GenerationFilter } from './generation-filter';

describe('GenerationFilter', () => {
  it('GenerationFilter should be constructed correctly', () => {
    const filter = new GenerationFilter(Generation.MSX2P);
    expect(filter.generation).toEqual(Generation.MSX2P);
  });
});

describe('GenerationFilter', () => {
  it('GenerationFilter should filter game that contains the filter generation', () => {
    const filter = new GenerationFilter(Generation.MSX2P);
    const game = new Game('name', '123', 123);
    game.setGenerations(1 | 4); // MSX and MSX2+
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('GenerationFilter', () => {
  it('GenerationFilter should not filter game that does not contain the filter generation', () => {
    const filter = new GenerationFilter(Generation.MSX2P);
    const game = new Game('name', '123', 123);
    game.setGenerations(1 | 8); // MSX and Turbo-R
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('GenerationFilter', () => {
  it('GenerationFilter should not filter game that does not have generation set', () => {
    const filter = new GenerationFilter(Generation.MSX2);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('GenerationFilter', () => {
  it('GenerationFilter should return correct identifier', () => {
    const filter = new GenerationFilter(Generation.MSXTR);
    expect(filter.getIdentifier()).toEqual(Generation.MSXTR);
  });
});
