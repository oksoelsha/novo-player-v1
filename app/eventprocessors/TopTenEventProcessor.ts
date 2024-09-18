import { BrowserWindow, ipcMain } from 'electron';
import * as Datastore from 'nedb';

export class TopTenEventProcessor {

    constructor(private readonly win: BrowserWindow, private readonly database: Datastore) {
        this.init();
    }

    private init(): void {
        ipcMain.on('getTopTenLaunchedGames', (event, pageSize: number, currentPage: number) => {
            this.getTopTenLaunchedGames(pageSize, currentPage);
        });
    }

    private getTopTenLaunchedGames(pageSize: number, currentPage: number): void {
        const self = this;
        const launchTimes: Map<string, number> = new Map<string, number>();

        this.database.find({}).exec((err: any, entries: any) => {
            for (let entry of entries) {
                const key = JSON.stringify({ name: entry.data.name, listing: entry.data.listing });
                launchTimes.set(key, this.getCount(launchTimes.get(key) || 0));
            }

            const allCounts = this.getTopTen(launchTimes);
            const total = allCounts.length > 10 ? 10 : allCounts.length;
            const startOfPage = currentPage * pageSize;
            const topTen = allCounts.slice(startOfPage, startOfPage + pageSize);
            const results = {total: total, counts: topTen};
            self.win.webContents.send('getTopTenLaunchedGamesResponse', results);
        });
    }

    private getCount(count: number): number {
        return count + 1;
    }

    private getTopTen(launchTimes: Map<string, number>): any[] {
        return Array.from(launchTimes.entries())
            .sort((a, b) => b[1] - a[1])
            .map(e => { return { game: JSON.parse(e[0]), count: e[1] }; })
            .slice(0, 10);
    }
}

