import { Game } from '../game';
import { SoundFilter } from './sound-filter';

describe('SoundFilter', () => {
  it('SoundFilter should be constructed correctly', () => {
    const filter = new SoundFilter(16); // MSX-MUSIC
    expect(filter.sound).toEqual(16);
  });
});

describe('SoundFilter', () => {
  it('SoundFilter should filter game that contains the filter sound', () => {
    const filter = new SoundFilter(16); // MSX-MUSIC
    const game = new Game('name', '123', 123);
    game.setSounds(1 | 16 | 64); // PSG, MSX-MUSIC and Moonsound
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('SoundFilter', () => {
  it('SoundFilter should not filter game that does not contain the filter sound', () => {
    const filter = new SoundFilter(32); // MSX-AUDIO
    const game = new Game('name', '123', 123);
    game.setSounds(1 | 16 | 64); // PSG, MSX-MUSIC and Moonsound
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('SoundFilter', () => {
  it('SoundFilter should not filter game that does not have sound set', () => {
    const filter = new SoundFilter(2);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});
