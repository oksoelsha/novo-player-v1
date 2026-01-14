import * as path from 'path';
import { OtherEmulatorExtraDataService } from './OtherEmulatorsExtraDataService';
import { ScreenshotsUtils } from './utils/ScreenshotsUtils';

export class SegaExtraDataService extends OtherEmulatorExtraDataService {

    constructor() {
        super(path.join(__dirname, 'data-files/extra-data-sega.dat'));
        ScreenshotsUtils.registerScreenshotsData(super.getExtraDataInfo(), 'segaScreenshot');
    }

    getSegaExtraDataInfo(): Map<string, string> {
        return super.getExtraDataInfo();
    }
}
