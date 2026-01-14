import * as path from 'path';
import { OtherEmulatorExtraDataService } from './OtherEmulatorsExtraDataService';
import { ScreenshotsUtils } from './utils/ScreenshotsUtils';

export class SpectravideoExtraDataService extends OtherEmulatorExtraDataService {

    constructor() {
        super(path.join(__dirname, 'data-files/extra-data-spectravideo.dat'));
        ScreenshotsUtils.registerScreenshotsData(super.getExtraDataInfo(), 'spectravideoScreenshot');
    }

    getSpectravideoExtraDataInfo(): Map<string, string> {
        return super.getExtraDataInfo();
    }
}
