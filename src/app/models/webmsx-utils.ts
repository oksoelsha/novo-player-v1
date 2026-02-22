import { FDDMode } from './fdd-mode';
import { Game } from './game';
import { InputDevice } from './input-device';

export const WebMSXMachinesData = [
  {value: 1, name: 'MSX1', label: 'MSX1'},
  {value: 2, name: 'MSX2', label: 'MSX2'},
  {value: 3, name: 'MSX2P', label: 'MSX2+'},
  {value: 4, name: 'MSXTR', label: 'Turbo-R'},
  {value: 5, name: 'ALALAMIAHAX370', label: 'MSX2 - Arabic', custom: true},
  {value: 6, name: 'MSX1A', label: 'MSX1 American (NTSC 60Hz)'},
  {value: 7, name: 'MSX1E', label: 'MSX1 European (PAL 50Hz)'},
  {value: 8, name: 'MSX1J', label: 'MSX1 Japanese (NTSC 60Hz)'},
  {value: 9, name: 'MSX2A', label: 'MSX2 American (NTSC 60Hz)'},
  {value: 10, name: 'MSX2E', label: 'MSX2 European (PAL 50Hz)'},
  {value: 11, name: 'MSX2J', label: 'MSX2 Japanese (NTSC 60Hz)'},
  {value: 12, name: 'MSX2PA', label: 'MSX2+ American (NTSC 60Hz)'},
  {value: 13, name: 'MSX2PE', label: 'MSX2+ European (PAL 50Hz)'},
  {value: 14, name: 'MSX2PJ', label: 'MSX2+ Japanese (NTSC 60Hz)'},
  {value: 15, name: 'MSXTRA', label: 'Turbo-R American (NTSC 60Hz)'},
  {value: 16, name: 'MSXTRE', label: 'Turbo-R European (PAL 50Hz)'},
  {value: 17, name: 'MSXTRJ', label: 'Turbo-R Japanese (NTSC 60Hz)'}
];

export class WebMSXUtils {
  static getMachineLabels(): string[] {
    return WebMSXMachinesData.map(d => d.label).sort();
  }

  static getLabelFromMachineValue(value: number): string {
    return WebMSXMachinesData.find(d => d.value === value).label;
  }

  static getMachineValueFromLabel(label: string): number {
    return WebMSXMachinesData.find(d => d.label === label).value;
  }

  static getMachineValueFromName(name: string): number {
    return WebMSXMachinesData.find(d => d.name === name).value;
  }

  static getMachineNameFromValue(value: number): string {
    return WebMSXMachinesData.find(d => d.value === value).name;
  }

  static isMachineCustom(value: number): boolean {
    return WebMSXMachinesData.find(d => d.value === value).custom;
  }

  static getWebMSXParams(game: Game): any {
    const webMSXParams: any = {};

    if (game.romA != null) {
      webMSXParams.ROM = game.romA;
    }
    if (game.diskA != null) {
      webMSXParams.DISK = game.diskA;
    }
    if (game.extensionRom === 'scc') {
      this.addWebMSXPresets(webMSXParams, 'SCC');
    } else if (game.extensionRom === 'scc+') {
      this.addWebMSXPresets(webMSXParams, 'SCCI');
    } else if (game.extensionRom === '2nd_PSG') {
      this.addWebMSXPresets(webMSXParams, 'DOUBLEPSG');
    }
    if (game.tape != null) {
      webMSXParams.TAPE = game.tape;
    }
    if (game.harddisk != null) {
      webMSXParams.HARDDISK = game.harddisk;
    }
    if (game.connectGFX9000) {
      this.addWebMSXPresets(webMSXParams, 'V9990');
    }
    if (game.inputDevice === InputDevice.indexOf('mouse')) {
      webMSXParams.MOUSE_MODE	= 1;
    }
    this.addWebMSXPresets(webMSXParams, 'OPL4');
    this.addWebMSXPresets(webMSXParams, 'MSXMUSIC');

    if (game.webmsxMachine) {
      if (WebMSXUtils.isMachineCustom(game.webmsxMachine)) {
        webMSXParams.CONFIG_URL = 'assets/webmsx-config/machines.json';
      }
      webMSXParams.MACHINE = WebMSXUtils.getMachineNameFromValue(game.webmsxMachine);
    }

    if (game.fddMode === FDDMode.indexOf('disablesecond')) {
      webMSXParams.BOOT_KEYS	= 'CONTROL';
    } else if (game.fddMode === FDDMode.indexOf('disableboth')) {
      webMSXParams.BOOT_KEYS	= 'SHIFT';
    }

    return webMSXParams;
  }

  private static addWebMSXPresets(webMSXParams: any, preset: string) {
    if (webMSXParams.PRESETS) {
      webMSXParams.PRESETS = webMSXParams.PRESETS + ',' + preset;
    } else {
      webMSXParams.PRESETS = preset;
    }
  }
}
