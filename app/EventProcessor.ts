import { BrowserWindow } from 'electron';
import * as Datastore from 'nedb';
import { TopTenEventProcessor } from './eventprocessors/TopTenEventProcessor'
import { TotalsForLast30DaysProcessor } from './eventprocessors/TotalsForLast30DaysProcessor';

export class EventProcessor {
    static initEventProcessors(win: BrowserWindow, database: Datastore) {
        new TopTenEventProcessor(win, database);
        new TotalsForLast30DaysProcessor(win, database);
    }
}
