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

      this.commandLineArguments.set('machine', machines);
      this.commandLineArguments.set('romtype1', romTypes);
      this.commandLineArguments.set('romtype2', romTypes);
    }
    return this.commandLineArguments;
  }
}
