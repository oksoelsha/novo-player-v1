export class QuickLaunchData {
    file: string;
    machine: string;
    parameters: string;

    constructor(file: string, machine: string, parameters: string) {
        this.file = file;
        this.machine = machine;
        this.parameters = parameters;
    }
}
