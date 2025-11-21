export class OpenmsxSetupDO {
  readonly name: string;
  readonly selectedMachine: string;
  readonly parameters: string;
  readonly connectGFX9000: boolean;

    constructor({
        name,
        selectedMachine,
        parameters,
        connectGFX9000,
    }: OpenmsxSetupDO) {
        Object.assign(this, {
            name,
            selectedMachine,
            parameters,
            connectGFX9000,
        });
    }
}
