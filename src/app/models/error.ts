export class Error {
    message: string;
    timestamp: number;

    constructor(message: string, timestamp: number = 0) {
        this.message = message;
        if (timestamp === 0) {
            this.timestamp = Date.now();
        } else {
            this.timestamp = timestamp;
        }
    }
}
