import * as path from 'path';
import { OtherEmulatorExtraDataService } from './OtherEmulatorsExtraDataService';
import { ScreenshotsUtils } from './utils/ScreenshotsUtils';

export class ColecoExtraDataService extends OtherEmulatorExtraDataService {

    constructor() {
        super(path.join(__dirname, 'data-files/extra-data-coleco.dat'));
        ScreenshotsUtils.registerScreenshotsData(super.getExtraDataInfo(), 'colecoScreenshot');
    }

    getColecoExtraDataInfo(): Map<string, string> {
        return super.getExtraDataInfo();
    }
}
