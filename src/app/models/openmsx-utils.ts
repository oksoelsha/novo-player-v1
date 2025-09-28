export class OpenMSXUtils {

  static commandLineArguments = new Map<string, string[]>();

  static getCommandLineArgumentsMap(): Map<string, string[]> {
    if (this.commandLineArguments.size === 0) {
      const romTypes = [
        'ASCII8',
        'ASCII16',
        'ASCII16-X',
        'Konami',
        'KonamiSCC',
        'KonamiUltimateCollection',
        'Normal',
        'page23'
      ];
      const extensions = [
        'fmpac',
        'gfx9000',
        'ide',
        'mbstereo',
        'MegaFlashROM_SCC+_SD',
        'moonsound',
        'scc',
        'scc+',
        '2nd_PSG'
      ];

      this.commandLineArguments.set('carta', []);
      this.commandLineArguments.set('cartb', []);
      this.commandLineArguments.set('command', []);
      this.commandLineArguments.set('diska', []);
      this.commandLineArguments.set('diskb', []);
      this.commandLineArguments.set('ext', extensions);
      this.commandLineArguments.set('ips', []);
      this.commandLineArguments.set('romtype', romTypes);
      this.commandLineArguments.set('replay', []);
      this.commandLineArguments.set('script', []);
    }
    return this.commandLineArguments;
  }
}
