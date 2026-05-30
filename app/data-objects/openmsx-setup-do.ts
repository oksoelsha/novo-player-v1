import { OpenmsxSetup } from "../../src/app/models/openmsx-setup";

export class OpenmsxSetupDO {
  readonly name!: string;
  readonly selectedMachine!: string;
  readonly parameters!: string;
  readonly connectGFX9000!: boolean;

    constructor({
        name,
        selectedMachine,
        parameters,
        connectGFX9000,
    }: OpenmsxSetup) {
        Object.assign(this, {
            name,
            selectedMachine,
            parameters,
            connectGFX9000,
        });
    }
}
