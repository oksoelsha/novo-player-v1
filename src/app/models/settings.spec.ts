import { DisplayMode, Settings } from './settings';

describe('Settings', () => {
  it('should create an instance', () => {
    expect(new Settings('openmsxPath', 'screenshotsPath', 'gameMusicPath', 'defaultListing',
      'webmsxPath', 'bluemsxPath', 'bluemsxParams', 'language', 'giantbombApiKey', true, DisplayMode[1],
      'emuliciousPath', 'emuliciousParams', true)).toBeTruthy();
  });
});
