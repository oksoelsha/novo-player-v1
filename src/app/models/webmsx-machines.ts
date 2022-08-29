export const WebMSXMachinesData = [
  {value: 1, name: 'MSX1', label: 'MSX'},
  {value: 2, name: 'MSX2', label: 'MSX2'},
  {value: 3, name: 'MSX2P', label: 'MSX2+'},
  {value: 4, name: 'MSXTR', label: 'MSX - Turbo-R'},
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
