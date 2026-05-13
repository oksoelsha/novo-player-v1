import { GameUtils } from './game-utils';
import { Game } from './game';

describe('GameUtils', () => {
  it('Generation functions should return true if corresponding bit is set', () => {
    const game: Game = new Game('name', '123abc', 32);
    game.setGenerations(15);
    expect(GameUtils.isMSX(game)).toBeTrue();
    expect(GameUtils.isMSX2(game)).toBeTrue();
    expect(GameUtils.isMSX2Plus(game)).toBeTrue();
    expect(GameUtils.isTurboR(game)).toBeTrue();
  });
});

describe('GameUtils', () => {
  it('Generation functions should return false if corresponding bit is not set', () => {
    const game: Game = new Game('name', '123abc', 64);
    game.setGenerations(0);
    expect(GameUtils.isMSX(game)).toBeFalse();
    expect(GameUtils.isMSX2(game)).toBeFalse();
    expect(GameUtils.isMSX2Plus(game)).toBeFalse();
    expect(GameUtils.isTurboR(game)).toBeFalse();
  });
});

describe('GameUtils', () => {
  it('Generation functions should return false if game generations field is not set', () => {
    const game: Game = new Game('name', '123abc', 64);
    expect(GameUtils.isMSX(game)).toBeFalse();
    expect(GameUtils.isMSX2(game)).toBeFalse();
    expect(GameUtils.isMSX2Plus(game)).toBeFalse();
    expect(GameUtils.isTurboR(game)).toBeFalse();
  });
});

describe('GameUtils', () => {
  it('Sound functions should return true if corresponding bit is set', () => {
    const game: Game = new Game('name', '123abc', 64);
    game.setSounds(255);
    expect(GameUtils.isPSG(game)).toBeTrue();
    expect(GameUtils.isSCC(game)).toBeTrue();
    expect(GameUtils.isSCCI(game)).toBeTrue();
    expect(GameUtils.isPCM(game)).toBeTrue();
    expect(GameUtils.isMSXMusic(game)).toBeTrue();
    expect(GameUtils.isMSXAudio(game)).toBeTrue();
    expect(GameUtils.isMoonsound(game)).toBeTrue();
    expect(GameUtils.isMidi(game)).toBeTrue();
  });
});

describe('GameUtils', () => {
  it('Sound functions should return false if corresponding bit is not set', () => {
    const game: Game = new Game('name', '123abc', 256);
    game.setSounds(0);
    expect(GameUtils.isPSG(game)).toBeFalse();
    expect(GameUtils.isSCC(game)).toBeFalse();
    expect(GameUtils.isSCCI(game)).toBeFalse();
    expect(GameUtils.isPCM(game)).toBeFalse();
    expect(GameUtils.isMSXMusic(game)).toBeFalse();
    expect(GameUtils.isMSXAudio(game)).toBeFalse();
    expect(GameUtils.isMoonsound(game)).toBeFalse();
    expect(GameUtils.isMidi(game)).toBeFalse();
  });
});

describe('GameUtils', () => {
  it('Sound functions should return false if game sounds field is not set', () => {
    const game: Game = new Game('name', '123abc', 256);
    expect(GameUtils.isPSG(game)).toBeFalse();
    expect(GameUtils.isSCC(game)).toBeFalse();
    expect(GameUtils.isSCCI(game)).toBeFalse();
    expect(GameUtils.isPCM(game)).toBeFalse();
    expect(GameUtils.isMSXMusic(game)).toBeFalse();
    expect(GameUtils.isMSXAudio(game)).toBeFalse();
    expect(GameUtils.isMoonsound(game)).toBeFalse();
    expect(GameUtils.isMidi(game)).toBeFalse();
  });
});

describe('GameUtils', () => {
  it('Genre function should return null if an undefined or out-of-range index is given', () => {
    expect(GameUtils.getGenre(undefined)).toBeNull();
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
