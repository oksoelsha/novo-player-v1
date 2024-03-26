import { Game } from '../../models/game';
import { GameCompanyAndYearPipe } from './game-company-and-year.pipe';

describe('GameCompanyAndYearPipe', () => {
  it('create an instance', () => {
    const pipe = new GameCompanyAndYearPipe();
    expect(pipe).toBeTruthy();
  });
});

describe('GameCompanyAndYearPipe', () => {
  it('transform function should return screenshot full path for given game and screenshots path', () => {
    const pipe = new GameCompanyAndYearPipe();

    const game1 = new Game('name1', '123', 10);
    game1.setCompany('company');
    game1.setYear('1990');
    expect(pipe.transform(game1)).toEqual('company - 1990');

    const game2 = new Game('name2', '234', 20);
    game2.setCompany('company2');
    expect(pipe.transform(game2)).toEqual('company2 - ');

    const game3 = new Game('name3', '234', 30);
    game3.setYear('1992');
    expect(pipe.transform(game3)).toEqual(' - 1992');

    const game4 = new Game('name4', '345', 50);
    expect(pipe.transform(game4)).toEqual(' - ');
  });
});
