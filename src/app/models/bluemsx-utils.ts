export class BlueMSXUtils {

  static commandLineArguments = new Map<string, string[]>();

  static getCommandLineArgumentsMap(): Map<string, string[]> {
    if (this.commandLineArguments.size === 0) {
      const machines = [
        'MSX',
        'MSX - Japanese',
        'MSX - Arabic',
        'MSX2',
        'MSX2 - Japanese',
        'MSX2 - Arabic',
        'MSX2+',
        'MSXturboR',
        'COL - ColecoVision',
        'SEGA - SG-1000'
      ];
      const romTypes = [
        'ASCII8',
        'ASCII16',
        'KonamiSCC',
        'scc',
        'scc+',
        'Coleco',
        'SG1000'
      ];

      this.commandLineArguments.set('cas', []);
      this.commandLineArguments.set('caszip', []);
      this.commandLineArguments.set('diskA', []);
      this.commandLineArguments.set('diskAzip', []);
      this.commandLineArguments.set('diskB', []);
      this.commandLineArguments.set('diskBzip', []);
      this.commandLineArguments.set('fullscreen', []);
      this.commandLineArguments.set('ide1primary', []);
      this.commandLineArguments.set('ide1secondary', []);
      this.commandLineArguments.set('language', []);
      this.commandLineArguments.set('machine', machines);
      this.commandLineArguments.set('rom1', []);
      this.commandLineArguments.set('rom1zip', []);
      this.commandLineArguments.set('rom2', []);
      this.commandLineArguments.set('rom2zip', []);
      this.commandLineArguments.set('romtype1', romTypes);
      this.commandLineArguments.set('romtype2', romTypes);
      this.commandLineArguments.set('theme', []);
    }
    return this.commandLineArguments;
  }
}
