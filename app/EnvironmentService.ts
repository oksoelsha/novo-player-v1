import * as path from 'path';
import * as fs from 'fs';
import { PersistenceUtils } from './utils/PersistenceUtils';
import { EnvironmentData } from '../src/app/models/environment-data';
import { VersionUtils } from '../src/app/models/version-utils';
import { Application } from './Application';

export class EnvironmentService {

    private readonly environmentFile = path.join(PersistenceUtils.getStoragePath(), 'environment');
    private readonly environmentData: EnvironmentData;

    constructor() {
        this.environmentData = this.getEnvironmentDataUponStart();
    }

    isNeedToUpdateApplicationData(): boolean {
        let needToUpdate = false;
        if (!this.environmentData.applicationVersion) {
            // This is an upgrade from <1.7 to 1.7+
            needToUpdate = true;
        } else if (VersionUtils.isVersionNewer(this.environmentData.applicationVersion, Application.VERSION)) {
            // This is the first time we run a new version >1.7
            needToUpdate = true;
        }
        return needToUpdate;
    }

    saveEnvironmentDataForNewApplicationVersion(): void {
        const newEnvironmentData = new EnvironmentData(Application.VERSION);
        const data = JSON.stringify(newEnvironmentData);
        fs.writeFileSync(this.environmentFile, data);
    }

    private getEnvironmentDataUponStart(): EnvironmentData {
        if (!fs.existsSync(this.environmentFile)) {
            return new EnvironmentData('');
        } else {
            const fileData = fs.readFileSync(this.environmentFile);
            return JSON.parse(fileData.toString());
        }
    }
}
