import { DisplayMode, Settings } from './settings';

describe('Settings', () => {
  it('should create an instance', () => {
    expect(new Settings('openmsxPath', 'screenshotsPath', 'gameMusicPath', 'defaultListing',
      'webmsxPath', 'bluemsxPath', 'bluemsxParams', 'language', true, DisplayMode[1], 'emuliciousPath',
      'emuliciousParams', true, 'gearcolecoPath', 'colecoScreenshotsPath', 'spectravideoScreenshotsPath',
      'segaScreenshotsPath')).toBeTruthy();
  });
});
