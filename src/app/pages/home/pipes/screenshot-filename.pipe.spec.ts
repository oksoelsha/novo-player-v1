import { Game } from '../../../models/game';
import { ScreenshotFilenamePipe } from './screenshot-filename.pipe';

describe('ScreenshotFilenamePipe', () => {
  it('create an instance', () => {
    const pipe = new ScreenshotFilenamePipe();
    expect(pipe).toBeTruthy();
  });
});

describe('ScreenshotFilenamePipe', () => {
  it('transform function should return screenshot full path for given game and screenshots path', () => {
    const pipe = new ScreenshotFilenamePipe();

    const game1 = new Game('name1', '123', 10);
    game1.setGenerationMSXId(2);
    expect(pipe.transform(game1, 'path/')).toEqual('path/2a.png');

    const game2 = new Game('name2', '234', 20);
    game2.setGenerationMSXId(3);
    game2.setScreenshotSuffix('s');
    expect(pipe.transform(game2, 'path/')).toEqual('path/3as.png');

    const game3 = new Game('name3', '234', 30);
    expect(pipe.transform(game3, 'path/')).toEqual('path/undefineda.png');
  });
});
