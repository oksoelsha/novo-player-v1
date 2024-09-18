import { Error } from "../../src/app/models/error";

export class ErrorDO {
    readonly message: string;
    readonly timestamp: number;

    constructor({ message, timestamp }: Error) {
        Object.assign(this, { message, timestamp });
    }
}
