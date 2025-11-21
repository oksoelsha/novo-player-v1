import { BrowserWindow, ipcMain } from 'electron';
import Datastore from 'nedb';
import * as path from 'path';
import { PersistenceUtils } from './utils/PersistenceUtils';
import { OpenmsxSetup } from '../src/app/models/openmsx-setup';
import { OpenmsxSetupDO } from './data/openmsx-setup-do';

export class OpenMSXSetupsService {

    private readonly database: Datastore;
    private readonly databaseFile = path.join(PersistenceUtils.getStoragePath(), 'setups');

    constructor(private readonly win: BrowserWindow) {
        this.database = new Datastore({ filename: this.databaseFile, autoload: true });
        this.init();
    }

    private init(): void {
        ipcMain.on('saveOpenmsxSetup', (event, setup: OpenmsxSetup) => {
            this.save(setup);
        });

        ipcMain.on('getOpenmsxSetups', (event) => {
            this.getSetups();
        });

        ipcMain.on('deleteOpenmsxSetup', (event, setup: OpenmsxSetup) => {
            this.delete(setup);
        });
    }

    private save(setup: OpenmsxSetup): void {
        const self = this;
        const setupDO = new OpenmsxSetupDO(setup);
        self.database.insert(setupDO, (err: any, savedSetup: OpenmsxSetupDO) => {
            self.win.webContents.send('saveOpenmsxSetupResponse', err === null);
        });
    }

    private getSetups(): void {
        const self = this;
        const setups: OpenmsxSetup[] = [];
        this.database.find({}, (err: any, entries: any) => {
            for (const entry of entries) {
                const setup = new OpenmsxSetup(entry.name, entry.selectedMachine, entry.parameters, entry.connectGFX9000);
                setups.push(setup);
            }
            self.win.webContents.send('getOpenmsxSetupsResponse', setups);
        });
    }

    private delete(setup: OpenmsxSetup): void {
        const self = this;
        this.database.remove({ name: setup.name }, {}, (err: any, numRemoved: number) => {
            self.win.webContents.send('deleteOpenmsxSetupResponse', numRemoved === 1);
        });
    }
}
