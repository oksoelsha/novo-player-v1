import { BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as http from 'http'
import { PersistenceUtils } from './utils/PersistenceUtils';
import { GamesService } from './GamesService';
import { ExtraDataService } from './ExtraDataService';
import { ErrorLogService } from './ErrorLogService';

export class DownloadService {

    private extraDataPathOnDisc: string = path.join(PersistenceUtils.getStoragePath(), 'extra-data.dat');

    constructor(private win: BrowserWindow, private extraDataService: ExtraDataService, private gamesService: GamesService,
        private errorLogService: ErrorLogService) {
        this.init();
    }

    private init() {
        ipcMain.on('downloadNewExtraData', (event: any) => {
            this.downloadNewExtraData();
        });
    }

    private async downloadNewExtraData() {
        try {
            await this.downloadExtraData();
            this.extraDataService.reinit();
            await this.gamesService.updateGamesForNewExtraData();    

            this.win.webContents.send('downloadNewExtraDataResponse', false);
        } catch (error) {
            this.win.webContents.send('downloadNewExtraDataResponse', true);
        }
    }

    private async downloadExtraData() {
        return new Promise<void>((resolve, reject) => {
            http.get('http://msxlaunchers.info/openmsx-launcher/new/extra-data', (res) => {
                const filePath = fs.createWriteStream(this.extraDataPathOnDisc);
                res.pipe(filePath);
                filePath.on('finish', () => {
                    filePath.close();
                    resolve();
                });
            }).on('error', err => {
                this.errorLogService.logError('failed to download from http://www.msxlaunchers.info/');
                reject();
            });
        });
    }
}
