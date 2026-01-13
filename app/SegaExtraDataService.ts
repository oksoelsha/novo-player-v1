import * as path from 'path';
import { OtherEmulatorExtraDataService } from './OtherEmulatorsExtraDataService';

export class SegaExtraDataService extends OtherEmulatorExtraDataService {

    constructor() {
        super(path.join(__dirname, 'data-files/extra-data-sega.dat'));
    }

    getSegaExtraDataInfo(): Map<string, string> {
        return super.getExtraDataInfo();
    }
}
