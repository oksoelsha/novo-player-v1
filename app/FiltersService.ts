import { BrowserWindow, ipcMain } from 'electron';
import Datastore from 'nedb';
import * as path from 'path';
import { PersistenceUtils } from './utils/PersistenceUtils';

export class FiltersService {

    private readonly database: Datastore;
    private readonly databaseFile = path.join(PersistenceUtils.getStoragePath(), 'filters');

    constructor(private readonly win: BrowserWindow) {
        this.database = new Datastore({ filename: this.databaseFile, autoload: true });
        this.init();
    }

    private init(): void {
        ipcMain.on('saveFilters', (event, filters: any) => {
            this.save(filters);
        });

        ipcMain.on('getFilters', (event) => {
            this.getFilters();
        });

        ipcMain.on('deleteFilters', (event, filters: any) => {
            this.delete(filters);
        });
    }

    private save(filters: any): void {
        const self = this;
        self.database.insert(filters, (err: any, savedFilters: any) => {
            self.win.webContents.send('saveFiltersResponse', err === null);
        });
    }

    private getFilters(): void {
        const self = this;
        this.database.find({}, (err: any, entries: any) => {
            self.win.webContents.send('getFiltersResponse', entries);
        });
    }

    private delete(filters: any): void {
        const self = this;
        this.database.remove({ name: filters.name }, {}, (err: any, numRemoved: number) => {
            self.win.webContents.send('deleteFiltersResponse', numRemoved === 1);
        });
    }
}
