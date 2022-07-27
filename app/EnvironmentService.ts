import * as path from 'path'
import * as fs from 'fs'
import { PersistenceUtils } from './utils/PersistenceUtils';
import { EnvironmentData } from '../src/app/models/environment-data';
import { ExtraDataService } from './ExtraDataService';
import { GamesService } from './GamesService';

export class EnvironmentService {

    private environmentData: EnvironmentData;
    private environmentDataPath = PersistenceUtils.getStoragePath();
    private environmentFile = path.join(this.environmentDataPath, 'environment');

    constructor(private extraDataService: ExtraDataService, private gamesService: GamesService) {
    }

    async init() {
        // here compare the extra-data file's version to the one in environment data
        // if the extra-data file version is newer -> update the games in the database
        const extraDataVersion = this.getAsInteger(this.extraDataService.getExtraDataVersion());
        const environmentExtraDataVersion = this.getAsInteger(this.getEnvironmentData().extraDataVersion);

        if (!environmentExtraDataVersion) {
            // this is the case where Novo Player 1.0+ is started for the first time after an upgrade
            // from a version earlier then 1.0
            // in this case consider this a game update case for the included extra-data
            await this.updateGames();
        } else if (extraDataVersion > environmentExtraDataVersion) {
            // this is the case when a future version of Novo Player is started after an upgrade
            // when the included extra-data is newer than the previous one whose version is recorded
            // in the environment data
            await this.updateGames();
        }
    }

    private getEnvironmentData(): EnvironmentData {
        if (this.environmentData === undefined) {
            if (!fs.existsSync(this.environmentFile)) {
                return new EnvironmentData('');
            } else {
                const fileData = fs.readFileSync(this.environmentFile);
                return JSON.parse(fileData.toString());
            }
        } else {
            return this.environmentData;
        }
    }

    private saveEnvironmentData(environmentData: EnvironmentData) {
        const data = JSON.stringify(environmentData);
        fs.writeFileSync(this.environmentFile, data);
        this.environmentData = environmentData;
    }

    private getAsInteger(version: string): number {
        return Number.parseInt(version.replace(/\./,''));
    }

    private async updateGames() {
        await this.gamesService.updateGamesForNewExtraData();

        const newEnvironmentData = new EnvironmentData(this.extraDataService.getExtraDataVersion());
        this.saveEnvironmentData(newEnvironmentData);
    }
}
