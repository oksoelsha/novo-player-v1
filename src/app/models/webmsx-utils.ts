import { FDDMode } from './fdd-mode';
import { Game } from './game';
import { Generation } from './generation';
import { InputDevice } from './input-device';

export const WebMSXMachinesData = [
  {value: 1, name: 'MSX1', label: Generation.MSX},
  {value: 2, name: 'MSX2', label: Generation.MSX2},
  {value: 3, name: 'MSX2P', label: Generation.MSX2P},
  {value: 4, name: 'MSXTR', label: Generation.MSXTR},
  {value: 5, name: 'ALALAMIAHAX370', label: 'MSX2 - Arabic', custom: true}
];

export class WebMSXUtils {
  static getMachineLabels(): string[] {
    return WebMSXMachinesData.map(d => d.label);
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
