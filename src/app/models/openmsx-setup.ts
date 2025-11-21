export class OpenmsxSetup {
  readonly name: string;
  readonly selectedMachine: string;
  readonly parameters: string;
  readonly connectGFX9000: boolean;

  constructor(name: string, selectedMachine: string, parameters: string, connectGFX9000: boolean) {
    this.name = name;
    this.selectedMachine = selectedMachine;
    this.parameters = parameters;
    this.connectGFX9000 = connectGFX9000;
  }
}
