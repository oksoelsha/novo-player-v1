export class QuickLaunchData {
    readonly file: string;
    readonly machine: string;
    readonly parameters: string;
    readonly connectGFX9000: boolean;

    constructor(file: string, machine: string, parameters: string, connectGFX9000: boolean) {
        this.file = file;
        this.machine = machine;
        this.parameters = parameters;
        this.connectGFX9000 = connectGFX9000;
    }
}
