import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs'
import { PersistenceUtils } from './utils/PersistenceUtils';
import { Error } from '../src/app/models/error';

export class ErrorLogService {

    private readonly errorFile: string = path.join(PersistenceUtils.getStoragePath(), 'errors');
    private readonly MAXIMUM_ERROR_ENTRIES: number = 50;
    private errors: Error[];

    constructor(private win: BrowserWindow) {
        if (!fs.existsSync(this.errorFile)) {
            this.errors = [];
        } else {
            this.errors = JSON.parse(fs.readFileSync(this.errorFile).toString());
        }
        this.init();
    }

    logError(...errorParts: string[]) {
        const error = new Error(errorParts.join(' '));
        this.errors.push(error);
        if (this.errors.length > this.MAXIMUM_ERROR_ENTRIES) {
            this.errors.shift();
        }
        this.writeErrorsToFile();
        console.log(new Date(error.timestamp).toString(), error.message);
    }

    private init() {
        ipcMain.on('getErrors', (event, pageSize: number, currentPage: number) => {
            this.getErrors(pageSize, currentPage);
        });
    }

    private writeErrorsToFile() {
        fs.writeFileSync(this.errorFile, JSON.stringify(this.errors));
    }

    private getErrors(pageSize: number, currentPage: number) {
        const total = this.errors.length;
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const errors = this.errors.slice(start, end);

        this.win.webContents.send('getErrorsResponse', { total, errors });
    }
}
