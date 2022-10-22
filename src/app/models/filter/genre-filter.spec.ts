import { GameUtils } from "../../../../release/win-unpacked/resources/src/app/models/game-utils";
import { Game } from "../game";
import { GenreFilter } from "./genre-filter";

describe('GenreFilter', () => {
  it('GenreFilter should be constructed correctly', () => {
    const genreCode = GameUtils.getGenreCode('Racing');
    const filter = new GenreFilter(genreCode);
    expect(filter.genre).toEqual(genreCode);
  });
});

describe('GenreFilter', () => {
  it('GenreFilter should filter game with with genre1 matching filter genre', () => {
    const genreCode = GameUtils.getGenreCode('Racing');
    const filter = new GenreFilter(genreCode);
    const game = new Game('name', '123', 123);
    game.setGenre1(genreCode);
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('GenreFilter', () => {
  it('GenreFilter should filter game with with genre2 matching filter genre', () => {
    const genreCode1 = GameUtils.getGenreCode('Action');
    const genreCode2 = GameUtils.getGenreCode('Racing');
    const filter = new GenreFilter(genreCode2);
    const game = new Game('name', '123', 123);
    game.setGenre1(genreCode1);
    game.setGenre2(genreCode2);
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('GenreFilter', () => {
  it('GenreFilter should not filter game with no genre matching filter genre', () => {
    const genreCode = GameUtils.getGenreCode('Racing');
    const genreCode1 = GameUtils.getGenreCode('Action');
    const genreCode2 = GameUtils.getGenreCode('Fighting');
    const filter = new GenreFilter(genreCode);
    const game = new Game('name', '123', 123);
    game.setGenre1(genreCode1);
    game.setGenre2(genreCode2);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('GenreFilter', () => {
  it('GenreFilter should not filter game with no genre set', () => {
    const genreCode = GameUtils.getGenreCode('Racing');
    const filter = new GenreFilter(genreCode);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});
