export class Backup {
    timestamp: number;
    name: string | null;

    constructor(timestamp: number, name: string | null = null) {
        this.timestamp = timestamp;
        this.name = name;
    }
}
