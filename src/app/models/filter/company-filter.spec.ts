import { Game } from "../game";
import { CompanyFilter } from "./company-filter";

describe('CompanyFilter', () => {
  it('CompanyFilter should be constructed correctly', () => {
    const filter = new CompanyFilter('company-name');
    expect(filter.company).toEqual('company-name');
  });
});

describe('CompanyFilter', () => {
  it('CompanyFilter should filter game with matching filter company', () => {
    const filter = new CompanyFilter('company-name');
    const game = new Game('name', '123', 123);
    game.setCompany('company-name');
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('CompanyFilter', () => {
  it('CompanyFilter should not filter game with non matching filter company', () => {
    const filter = new CompanyFilter('company-name');
    const game = new Game('name', '123', 123);
    game.setCompany('different-company-name');
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('CompanyFilter', () => {
  it('CompanyFilter should not filter game with no company set', () => {
    const filter = new CompanyFilter('company-name');
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});
