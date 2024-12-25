export class EmuliciousUtils {

  static commandLineArguments = new Map<string, string[]>();

  static getCommandLineArgumentsMap(): Map<string, string[]> {
    if (this.commandLineArguments.size === 0) {
      const properties = [
        'MSXBIOS=',
        'MSX2BIOS=',
        'MSX2SubROM=',
        'MSXDOS2ROM=',
        'MSXDiskROM=',
        'MSXSCCCartridgeEnabled=',
        'MSXFMPACROM=',
        'MSXModel=0',
        'MSXModel=1',
        'Scale=',
        'System=MSX',
        'System=GAME_GEAR',
        'System=MASTER_SYSTEM',
      ];

      this.commandLineArguments.set('muted', []);
      this.commandLineArguments.set('scale', []);
      this.commandLineArguments.set('link', []);
      this.commandLineArguments.set('linkport', []);
      this.commandLineArguments.set('fullscreen', []);
      this.commandLineArguments.set('set', properties);
      this.commandLineArguments.set('turbo', []);
      this.commandLineArguments.set('throttle', []);
      this.commandLineArguments.set('disassemble', []);
    }
    return this.commandLineArguments;
  }
}
