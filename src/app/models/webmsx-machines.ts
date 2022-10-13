import { Generation } from "./generation";

export const WebMSXMachinesData = [
  {value: 1, name: 'MSX1', label: Generation.MSX},
  {value: 2, name: 'MSX2', label: Generation.MSX2},
  {value: 3, name: 'MSX2P', label: Generation.MSX2P},
  {value: 4, name: 'MSXTR', label: Generation.MSXTR},
  {value: 5, name: 'ALALAMIAHAX370', label: 'MSX2 - Arabic', custom: true}
];

export class WebMSXMachineUtils {
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
}
