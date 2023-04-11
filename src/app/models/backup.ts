export class Backup {
    timestamp: number;
    name: string;

    constructor(timestamp: number, name: string = null) {
        this.timestamp = timestamp;
        this.name = name;
    }
}
