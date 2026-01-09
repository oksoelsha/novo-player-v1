import * as path from 'path';
import { OtherEmulatorExtraDataService } from './OtherEmulatorsExtraDataService';

export class SpectravideoExtraDataService extends OtherEmulatorExtraDataService {

    constructor() {
        super(path.join(__dirname, 'data-files/extra-data-spectravideo.dat'));
    }

    getSpectravideoExtraDataInfo(): Map<string, string> {
        return super.getExtraDataInfo();
    }
}
