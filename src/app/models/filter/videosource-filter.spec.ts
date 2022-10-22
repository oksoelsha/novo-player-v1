import { Game } from "../game";
import { VideoSourceFilter } from "./videosource-filter";

describe('VideoSourceFilter', () => {
  it('VideoSourceFilter should be constructed correctly', () => {
    const filter = new VideoSourceFilter(true);
    expect(filter.checkGFX9000).toBeTrue()
  });
});

describe('VideoSourceFilter', () => {
  it('VideoSourceFilter should filter game that contains the filter video source', () => {
    const filter = new VideoSourceFilter(true);
    const game = new Game('name', '123', 123);
    game.setConnectGFX9000(true);
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('VideoSourceFilter', () => {
  it('VideoSourceFilter should not filter game that does not contain the filter video source', () => {
    const filter = new VideoSourceFilter(true);
    const game = new Game('name', '123', 123);
    game.setConnectGFX9000(false);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('VideoSourceFilter', () => {
  it('VideoSourceFilter should filter game that does not have video source set but filter is MSX source', () => {
    const filter = new VideoSourceFilter(false);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeTrue();
  });
});
