import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Event } from '../models/event';
import { Observable, Subject } from 'rxjs';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private ipc: IpcRenderer;
  private subject = new Subject<void>();

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
    this.ipc.on('logErrorResponse', (event) => {
      this.subject.next();
    });
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

  async getLaunchTotalsForLast30Days(): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.ipc.once('getLaunchTotalsForLast30DaysResponse', (event, totals) => {
        resolve(totals);
      });
      this.ipc.send('getLaunchTotalsForLast30Days');
    });
  }

  async getErrors(pageSize: number, currentPage: number): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.ipc.once('getErrorsResponse', (event, errorsData) => {
        resolve(errorsData);
      });
      this.ipc.send('getErrors', pageSize, currentPage);
    });
  }

  async getLastPlayedTime(game: Game): Promise<Event> {
    return new Promise<Event>((resolve, reject) => {
      this.ipc.once('getLastPlayedTimeResponse', (event, loggedEvent: Event) => {
        resolve(loggedEvent);
      });
      this.ipc.send('getLastPlayedTime', game);
    });
  }

  getNewErrorNotification(): Observable<void> {
    return this.subject.asObservable();
  }
}
