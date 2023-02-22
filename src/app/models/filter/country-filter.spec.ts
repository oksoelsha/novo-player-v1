import { Game } from '../game';
import { CountryFilter } from './country-filter';

describe('CountryFilter', () => {
  it('CountryFilter should be constructed correctly', () => {
    const filter = new CountryFilter('country-code');
    expect(filter.country).toEqual('country-code');
  });
});

describe('CountryFilter', () => {
  it('CountryFilter should filter game with matching filter country', () => {
    const filter = new CountryFilter('country-code');
    const game = new Game('name', '123', 123);
    game.setCountry('country-code');
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('CountryFilter', () => {
  it('CountryFilter should not filter game with non matching filter country', () => {
    const filter = new CountryFilter('country-name');
    const game = new Game('name', '123', 123);
    game.setCountry('different-country-name');
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('CountryFilter', () => {
  it('CountryFilter should not filter game with no country set', () => {
    const filter = new CountryFilter('country-name');
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('CountryFilter', () => {
  it('CountryFilter should return correct identifier', () => {
    const filter = new CountryFilter('country-code');
    expect(filter.getIdentifier()).toEqual('country-code');
  });
});
