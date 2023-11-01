import { Error } from "../../src/app/models/error";

export class ErrorDO {
    message: string;
    timestamp: number;

    constructor(error: Error) {
        this.message = error.message;
        this.timestamp = error.timestamp;
    }
}
