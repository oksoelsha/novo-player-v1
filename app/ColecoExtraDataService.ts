import * as path from 'path';
import { OtherEmulatorExtraDataService } from './OtherEmulatorsExtraDataService';

export class ColecoExtraDataService extends OtherEmulatorExtraDataService {

    constructor() {
        super(path.join(__dirname, 'data-files/extra-data-coleco.dat'));
    }

    getColecoExtraDataInfo(): Map<string, string> {
        return super.getExtraDataInfo();
    }
}
