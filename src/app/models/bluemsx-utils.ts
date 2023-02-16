export class BlueMSXUtils {

  static CommandLineArguments = new Map<string, string[]>();

  static getCommandLineArgumentsMap(): Map<string, string[]> {
    if (this.CommandLineArguments.size === 0) {
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

      this.CommandLineArguments.set('machine', machines);
      this.CommandLineArguments.set('romtype1', romTypes);
      this.CommandLineArguments.set('romtype2', romTypes);  
    }
    return this.CommandLineArguments;
  }
}
