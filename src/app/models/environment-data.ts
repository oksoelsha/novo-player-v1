export class EnvironmentData {
    readonly applicationVersion: string;
    readonly extraDataVersion: string;  // needed for backwards compatibility

    constructor(applicationVersion: string) {
        this.applicationVersion = applicationVersion;
        this.extraDataVersion = '';
    }
}
