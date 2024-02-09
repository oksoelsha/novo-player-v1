import { BrowserWindow, ipcMain } from 'electron';
import Datastore from 'nedb';
import * as path from 'path';
import { Event } from '../src/app/models/event';
import { EventDO } from './data/event-do';
import { EventProcessor } from './EventProcessor';
import { PersistenceUtils } from './utils/PersistenceUtils';
import { Game } from '../src/app/models/game';

export class EventLogService {

    private database: Datastore;
    private readonly databaseFile = path.join(PersistenceUtils.getStoragePath(), 'events');
    private readonly MAXIMUM_LOG_ENTRIES = 600;

    constructor(private win: BrowserWindow) {
        this.database = new Datastore({ filename: this.databaseFile, autoload: true });
        EventProcessor.initEventProcessors(win, this.database);
        this.init();
    }

    logEvent(userEvent: Event) {
        const self = this;
        const eventDO = new EventDO(userEvent);

        this.database.count({}, (err: any, count: number) => {
            if (count >= self.MAXIMUM_LOG_ENTRIES) {
                self.database.find({}).sort({ timestamp: 1 }).limit(1).exec((err: any, entry: any) => {
                    self.database.remove({ _id: entry[0]._id }, {}, (err: any, numRemoved: number) => {
                    });
                });
            }
            self.database.insert(eventDO, (err: any, savedEvent: EventDO) => {
            });
        });
    }

    private init() {
        ipcMain.on('logEvent', (event, userEvent: Event) => {
            this.logEvent(userEvent);
        });

        ipcMain.on('getEvents', (event, pageSize: number, currentPage: number) => {
            this.getEvents(pageSize, currentPage);
        });

        ipcMain.on('getLastPlayedTime', (event, game: Game) => {
            this.getLastPlayedTime(game);
        });
    }

    private getEvents(pageSize: number, currentPage: number) {
        const self = this;
        const events: Event[] = [];

        this.database.count({}, (err: any, count: number) => {
            const total = count;
            const offset = currentPage * pageSize;
            self.database.find({}).sort({ timestamp: -1 }).skip(offset).limit(pageSize).exec((err: any, entries: any) => {
                for (const entry of entries) {
                    const event = new Event(entry.source, entry.type, entry.data, entry.timestamp);
                    events.push(event);
                }
                self.win.webContents.send('getEventsResponse', { total, events });
            });
        });
    }

    private getLastPlayedTime(game: Game) {
        this.database.find({ 'data.sha1': game.sha1Code }).sort({ timestamp: -1 }).exec((err: any, entries: any) => {
            if (entries.length > 0) {
                const event = new Event(entries[0].source, entries[0].type, entries[0].data, entries[0].timestamp);
                this.win.webContents.send('getLastPlayedTimeResponse', event);
            } else {
                this.win.webContents.send('getLastPlayedTimeResponse', null);
            }
        });
    }
}
