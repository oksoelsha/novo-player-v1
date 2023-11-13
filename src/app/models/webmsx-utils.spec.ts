import { FDDMode } from './fdd-mode';
import { Game } from './game';
import { Generation } from './generation';
import { InputDevice } from './input-device';
import { WebMSXUtils } from './webmsx-utils';

describe('WebMSXUtils', () => {
  it('getLabelFromMachineValue function should return machine label for a given machine value', () => {
    expect(WebMSXUtils.getLabelFromMachineValue(1)).toEqual(Generation.MSX);
    expect(WebMSXUtils.getLabelFromMachineValue(3)).toEqual(Generation.MSX2P);
    expect(WebMSXUtils.getLabelFromMachineValue(5)).toEqual('MSX2 - Arabic');
  });
});

describe('WebMSXUtils', () => {
  it('getMachineValueFromLabel function should return machine value for a given machine label', () => {
    expect(WebMSXUtils.getMachineValueFromLabel(Generation.MSX2)).toEqual(2);
    expect(WebMSXUtils.getMachineValueFromLabel(Generation.MSXTR)).toEqual(4);
  });
});

describe('WebMSXUtils', () => {
  it('getMachineValueFromName function should return machine value for a given machine name', () => {
    expect(WebMSXUtils.getMachineValueFromName('MSX1')).toEqual(1);
    expect(WebMSXUtils.getMachineValueFromName('MSX2P')).toEqual(3);
    expect(WebMSXUtils.getMachineValueFromName('MSXTR')).toEqual(4);
    expect(WebMSXUtils.getMachineValueFromName('ALALAMIAHAX370')).toEqual(5);
  });
});

describe('WebMSXUtils', () => {
  it('getMachineNameFromValue function should return machine name for a given machine value', () => {
    expect(WebMSXUtils.getMachineNameFromValue(1)).toEqual('MSX1');
    expect(WebMSXUtils.getMachineNameFromValue(2)).toEqual('MSX2');
    expect(WebMSXUtils.getMachineNameFromValue(5)).toEqual('ALALAMIAHAX370');
  });
});

describe('WebMSXUtils', () => {
  it('isMachineCustom function should return if a machine is custom for a given machine value', () => {
    expect(WebMSXUtils.isMachineCustom(1)).toBeFalsy();
    expect(WebMSXUtils.isMachineCustom(2)).toBeFalsy();
    expect(WebMSXUtils.isMachineCustom(3)).toBeFalsy();
    expect(WebMSXUtils.isMachineCustom(4)).toBeFalsy();
    expect(WebMSXUtils.isMachineCustom(5)).toBeTrue();
  });
});

describe('WebMSXUtils', () => {
  it('getWebMSXParams function should return WebMSX parameters for the given game', () => {
    let game: Game;

    game = new Game('nameRom', '1', 1);
    game.setRomA('romA');
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({ROM: 'romA', PRESETS: 'OPL4,MSXMUSIC'});

    game = new Game('nameDisk', '1', 1);
    game.setDiskA('diskA');
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({DISK: 'diskA', PRESETS: 'OPL4,MSXMUSIC'});

    game = new Game('nameRomAndDisk', '1', 1);
    game.setRomA('romA');
    game.setDiskA('diskA');
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({ROM: 'romA', DISK: 'diskA', PRESETS: 'OPL4,MSXMUSIC'});

    game = new Game('nameDiskAndSCC', '1', 1);
    game.setDiskA('diskA');
    game.setExtensionRom('scc');
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({DISK: 'diskA', PRESETS: 'SCC,OPL4,MSXMUSIC'});

    game = new Game('nameRomAndSCC+', '1', 1);
    game.setRomA('romA');
    game.setExtensionRom('scc+');
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({ROM: 'romA', PRESETS: 'SCCI,OPL4,MSXMUSIC'});

    game = new Game('nameTape', '1', 1);
    game.setTape('tape');
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({TAPE: 'tape', PRESETS: 'OPL4,MSXMUSIC'});

    game = new Game('nameHarddisk', '1', 1);
    game.setHarddisk('harddisk');
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({HARDDISK: 'harddisk', PRESETS: 'OPL4,MSXMUSIC'});

    game = new Game('nameRomAndGFX9000', '1', 1);
    game.setRomA('romA');
    game.setConnectGFX9000(true);
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({ROM: 'romA', PRESETS: 'V9990,OPL4,MSXMUSIC'});

    game = new Game('nameDiskAndMouse', '1', 1);
    game.setDiskA('diskA');
    game.setInputDevice(InputDevice.indexOf('mouse'));
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({DISK: 'diskA', MOUSE_MODE: 1, PRESETS: 'OPL4,MSXMUSIC'});

    game = new Game('nameRomAndStandardWebMSXMachine', '1', 1);
    game.setRomA('romA');
    game.setWebmsxMachine(WebMSXUtils.getMachineValueFromLabel(Generation.MSX));
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual(
      {
        ROM: 'romA',
        MACHINE: WebMSXUtils.getMachineNameFromValue(game.webmsxMachine),
        PRESETS: 'OPL4,MSXMUSIC'
      }
    );

    game = new Game('nameDiskAndCustomWebMSXMachine', '1', 1);
    game.setDiskA('diskA');
    game.setWebmsxMachine(WebMSXUtils.getMachineValueFromLabel('MSX2 - Arabic'));
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual(
      {
        DISK: 'diskA',
        MACHINE: WebMSXUtils.getMachineNameFromValue(game.webmsxMachine),
        CONFIG_URL: 'assets/webmsx-config/machines.json',
        PRESETS: 'OPL4,MSXMUSIC'
      }
    );

    game = new Game('nameDiskAndFDDModeDisableSecond', '1', 1);
    game.setDiskA('diskA');
    game.setFddMode(FDDMode.indexOf('disablesecond'));
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({DISK: 'diskA', BOOT_KEYS: 'CONTROL', PRESETS: 'OPL4,MSXMUSIC'});

    game = new Game('nameDiskAndFDDModeDisableBoth', '1', 1);
    game.setDiskA('diskA');
    game.setFddMode(FDDMode.indexOf('disableboth'));
    expect(WebMSXUtils.getWebMSXParams(game)).toEqual({DISK: 'diskA', BOOT_KEYS: 'SHIFT', PRESETS: 'OPL4,MSXMUSIC'});
  });
});
