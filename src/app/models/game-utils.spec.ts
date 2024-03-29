import { GameUtils } from './game-utils';
import { Game } from './game';

describe('GameUtils', () => {
  it('Generation functions should return true if corresponding bit is set', () => {
    const game: Game = new Game('name', '123abc', 32);
    game.setGenerations(15);
    expect(GameUtils.isMSX(game)).toBeTruthy();
    expect(GameUtils.isMSX2(game)).toBeTruthy();
    expect(GameUtils.isMSX2Plus(game)).toBeTruthy();
    expect(GameUtils.isTurboR(game)).toBeTruthy();
  });
});

describe('GameUtils', () => {
  it('Generation functions should return false if corresponding bit is not set', () => {
    const game: Game = new Game('name', '123abc', 64);
    game.setGenerations(0);
    expect(GameUtils.isMSX(game)).toBeFalsy();
    expect(GameUtils.isMSX2(game)).toBeFalsy();
    expect(GameUtils.isMSX2Plus(game)).toBeFalsy();
    expect(GameUtils.isTurboR(game)).toBeFalsy();
  });
});

describe('GameUtils', () => {
  it('Sound functions should return true if corresponding bit is set', () => {
    const game: Game = new Game('name', '123abc', 64);
    game.setSounds(255);
    expect(GameUtils.isPSG(game)).toBeTruthy();
    expect(GameUtils.isSCC(game)).toBeTruthy();
    expect(GameUtils.isSCCI(game)).toBeTruthy();
    expect(GameUtils.isPCM(game)).toBeTruthy();
    expect(GameUtils.isMSXMusic(game)).toBeTruthy();
    expect(GameUtils.isMSXAudio(game)).toBeTruthy();
    expect(GameUtils.isMoonsound(game)).toBeTruthy();
    expect(GameUtils.isMidi(game)).toBeTruthy();
  });
});

describe('GameUtils', () => {
  it('Sound functions should return false if corresponding bit is not set', () => {
    const game: Game = new Game('name', '123abc', 256);
    game.setSounds(0);
    expect(GameUtils.isPSG(game)).toBeFalsy();
    expect(GameUtils.isSCC(game)).toBeFalsy();
    expect(GameUtils.isSCCI(game)).toBeFalsy();
    expect(GameUtils.isPCM(game)).toBeFalsy();
    expect(GameUtils.isMSXMusic(game)).toBeFalsy();
    expect(GameUtils.isMSXAudio(game)).toBeFalsy();
    expect(GameUtils.isMoonsound(game)).toBeFalsy();
    expect(GameUtils.isMidi(game)).toBeFalsy();
  });
});

describe('GameUtils', () => {
  it('Genre function should return null if an out-of-range index is given', () => {
    expect(GameUtils.getGenre(0)).toBeNull();
    expect(GameUtils.getGenre(52)).toBeNull();
  });
});

describe('GameUtils', () => {
  it('Genre function should a genre if a valid index is given', () => {
    expect(GameUtils.getGenre(1)).toEqual('Action');
    expect(GameUtils.getGenre(32)).toEqual('Shoot-\'em-up | First-person shooter');
    expect(GameUtils.getGenre(51)).toEqual('Dungeon');
  });
});

describe('GameUtils', () => {
  it('GenreCode function should a genre code if a valid genre string is given', () => {
    expect(GameUtils.getGenreCode('Action')).toEqual(1);
    expect(GameUtils.getGenreCode('Shoot-\'em-up | First-person shooter')).toEqual(32);
    expect(GameUtils.getGenreCode('Dungeon')).toEqual(51);
    expect(GameUtils.getGenreCode('Unknown')).toEqual(0);
    expect(GameUtils.getGenreCode('wrong')).toEqual(0);
  });
});

describe('GameUtils', () => {
  it('getMonikor function should return a valid monikor for a given game', () => {
    const game: Game = new Game('name', '123abc', 256);
    game.setListing('listing');
    expect(GameUtils.getMonikor(game).name).toEqual('name');
    expect(GameUtils.getMonikor(game).listing).toEqual('listing');
    expect(GameUtils.getMonikor(game).sha1).toEqual('123abc');
  });
});

describe('GameUtils', () => {
  it('getGenerationMSXURLForGame function should return Generation MSX URL for a given Generation MSX Id', () => {
    expect(GameUtils.getGenerationMSXURLForGame(123)).toEqual('http://www.generation-msx.nl/msxdb/softwareinfo/123');
  });
});
