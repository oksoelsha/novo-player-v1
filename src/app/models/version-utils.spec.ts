import { VersionUtils } from './version-utils';

describe('VersionsUtils', () => {
  it('isVersionNewer function should return true or false based on input versions', () => {
    expect(VersionUtils.isVersionNewer('1', '2')).toBeTrue();
    expect(VersionUtils.isVersionNewer('1.2', '1.3')).toBeTrue();
    expect(VersionUtils.isVersionNewer('1.2', '1.2')).toBeFalse();
    expect(VersionUtils.isVersionNewer('1.3', '1.2')).toBeFalse();
    expect(VersionUtils.isVersionNewer('1.3', '3.4.9')).toBeTrue();
    expect(VersionUtils.isVersionNewer('2.1', '2.1.0')).toBeFalse();
    expect(VersionUtils.isVersionNewer('2.1', '2.1.1')).toBeTrue();
    expect(VersionUtils.isVersionNewer('2.1.1', '2.1')).toBeFalse();
    expect(VersionUtils.isVersionNewer('1.12.13.3', '1.12.13.4')).toBeTrue();
    expect(VersionUtils.isVersionNewer('1.3', null)).toBeFalse();
    expect(VersionUtils.isVersionNewer(null, '3.4')).toBeFalse();
    expect(VersionUtils.isVersionNewer('1.3', '')).toBeFalse();
    expect(VersionUtils.isVersionNewer('', '3.4')).toBeFalse();
    expect(VersionUtils.isVersionNewer('1.6', '1.5.2')).toBeFalse();
    expect(VersionUtils.isVersionNewer('1.5.2', '1.6')).toBeTrue();
  });
});
