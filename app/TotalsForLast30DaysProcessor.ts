import { BrowserWindow, ipcMain } from 'electron';
import * as Datastore from 'nedb';
import { EventProcessor } from './EventProcessor';

export class TotalsForLast30DaysProcessor implements EventProcessor {

    private readonly milSecondsPerDay = 86400000;

    constructor(private win: BrowserWindow, private database: Datastore) {
        this.init();
    }

    process(): void {
        // nothing to implement in this case
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
        const beginningOfThatDay = Math.floor(thirtyDaysAgo / this.milSecondsPerDay) * this.milSecondsPerDay + localZoneOffset;

        const results = {
            openMSX: Array(30).fill(0),
            WebMSX: Array(30).fill(0),
            blueMSX: Array(30).fill(0)
        }
        this.database.find({ timestamp: { $gte: beginningOfThatDay } }).exec((err: any, entries: any) => {
            for (const entry of entries) {
                const index = self.getIndex(beginningOfThatDay, entry.timestamp);
                if (entry.source == 0) {
                    results.openMSX[index]++;
                } else if (entry.source == 1) {
                    results.WebMSX[index]++;
                } else if (entry.source == 2) {
                    results.blueMSX[index]++;
                }
            }
            self.win.webContents.send('getLaunchTotalsForLast30DaysResponse', results);
        });
    }

    private getIndex(beginning: number, timestamp: number): number {
        return Math.floor((timestamp - beginning) / this.milSecondsPerDay);
    }
}
