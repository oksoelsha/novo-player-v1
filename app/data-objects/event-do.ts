export class EventDO {
    readonly source: number;
    readonly type: number;
    readonly data: string;
    readonly timestamp: number;

    constructor({
        source,
        type,
        data,
        timestamp,
    }: EventDO) {
        Object.assign(this, {
            source,
            type,
            data,
            timestamp,
        });
    }
}
