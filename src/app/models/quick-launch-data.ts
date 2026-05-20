export class QuickLaunchData {
    readonly file: string | undefined;
    readonly machine: string;
    readonly parameters: string | undefined;
    readonly connectGFX9000: boolean;

    constructor(file: string | undefined, machine: string, parameters: string | undefined, connectGFX9000: boolean) {
        this.file = file;
        this.machine = machine;
        this.parameters = parameters;
        this.connectGFX9000 = connectGFX9000;
    }
}
