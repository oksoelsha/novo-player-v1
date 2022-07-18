import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Event } from '../models/event';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private ipc: IpcRenderer;

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
  }

  logEvent(event: Event) {
    this.ipc.send('logEvent', event);
  }

  async getEvents(pageSize: number, currentPage: number): Promise<Event[]> {
    return new Promise<Event[]>((resolve, reject) => {
      this.ipc.once('getEventsResponse', (event, eventsData) => {
        resolve(eventsData);
      });
      this.ipc.send('getEvents', pageSize, currentPage);
    });
  }

  async getTopTenLaunchedGames(pageSize: number, currentPage: number): Promise<[]> {
    return new Promise<[]>((resolve, reject) => {
      this.ipc.once('getTopTenLaunchedGamesResponse', (event, data) => {
        resolve(data);
      });
      this.ipc.send('getTopTenLaunchedGames', pageSize, currentPage);
    });
  }

  async getLaunchTotalsForLast30Days(): Promise<Object> {
    return new Promise<Object>((resolve, reject) => {
      this.ipc.once('getLaunchTotalsForLast30DaysResponse', (event, totals) => {
        resolve(totals);
      });
      this.ipc.send('getLaunchTotalsForLast30Days');
    });
  }
}
