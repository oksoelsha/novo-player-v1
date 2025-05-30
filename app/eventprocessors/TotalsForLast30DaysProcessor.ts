import { BrowserWindow, ipcMain } from 'electron';
import * as Datastore from 'nedb';
import { EventSource } from '../../src/app/models/event'

export class TotalsForLast30DaysProcessor {

    private readonly milSecondsPerDay = 86400000;

    constructor(private win: BrowserWindow, private database: Datastore) {
        this.init();
    }

    private init() {
        ipcMain.on('getLaunchTotalsForLast30Days', (event, pageSize: number, currentPage: number) => {
            this.getLaunchTotalsForLast30Days();
        });
    }

    private getLaunchTotalsForLast30Days() {
        const self = this;

        const now = Date.now();
        const localZoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
        const thirtyDaysAgo = now - this.milSecondsPerDay * 29;
        // use local machine midnight
        const midnightThatDay = Math.floor((thirtyDaysAgo - localZoneOffset) / this.milSecondsPerDay) * this.milSecondsPerDay;
        const midnightThatDayLocal = midnightThatDay + localZoneOffset;
        const results = {
            openMSX: Array(30).fill(0),
            WebMSX: Array(30).fill(0),
            blueMSX: Array(30).fill(0),
            Emulicious: Array(30).fill(0)
        }
        this.database.find({ timestamp: { $gte: midnightThatDayLocal } }).exec((err: any, entries: any) => {
            for (const entry of entries) {
                const index = self.getIndex(midnightThatDayLocal, entry.timestamp);
                if (entry.source === EventSource.openMSX) {
                    results.openMSX[index]++;
                } else if (entry.source === EventSource.WebMSX) {
                    results.WebMSX[index]++;
                } else if (entry.source === EventSource.blueMSX) {
                    results.blueMSX[index]++;
                } else if (entry.source === EventSource.Emulicious) {
                    results.Emulicious[index]++;
                }
            }
            self.win.webContents.send('getLaunchTotalsForLast30DaysResponse', results);
        });
    }

    private getIndex(beginning: number, timestamp: number): number {
        return Math.floor((timestamp - beginning) / this.milSecondsPerDay);
    }
}
