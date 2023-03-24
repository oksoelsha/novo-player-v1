import { QuickLaunchData } from "./quick-launch-data";

describe('QuickLaunchData', () => {
  it('should create an instance', () => {
    expect(new QuickLaunchData('file', 'machine', 'parameters')).toBeTruthy();
  });
});
