export enum EventSource {
    openMSX = 0,
    WebMSX = 1,
    blueMSX = 2,
    Emulicious = 3,
    Gearcoleco = 4
}

export enum EventType {
    LAUNCH = 0,
}

export class Event {
    source: EventSource;
    type: EventType;
    data: any;
    timestamp: number;

    constructor(source: EventSource, type: EventType, data: any, timestamp: number = 0) {
        this.source = source;
        this.type = type;
        this.data = data;
        if (timestamp === 0) {
            this.timestamp = Date.now();
        } else {
            this.timestamp = timestamp;
        }
    }
}
