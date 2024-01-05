import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';
import { EventSource } from '../models/event';
import { Game } from '../models/game';
import { GamePassword } from '../models/game-passwords-info';

@Injectable({
  providedIn: 'root'
})
export class LaunchActivityService {

  private launchActivitiesSubject = new Subject<LaunchActivity[]>();
  private launchActivities: LaunchActivity[] = [];
  private openmsxEventSubject = new Subject<OpenmsxEvent>();
  private ipc: IpcRenderer;
  private openmsxCurrentStatus: Map<number, Set<string>> = new Map();

  constructor() {
    this.ipc = window.require('electron').ipcRenderer;
    this.ipc.on('openmsxUpdateEvent', (event: any, pid: number, name: string, state: boolean) => {
      const openmsxEvent = new OpenmsxEvent(pid, name, state);
      this.updateOpenmsxCurrentStatus(pid, openmsxEvent);
      this.openmsxEventSubject.next(openmsxEvent);
    });
  }

  recordGameStart(game: Game, time: number, pid: number, source: EventSource) {
    this.launchActivities.push(new LaunchActivity(game, time, pid, source));
    this.launchActivitiesSubject.next(this.launchActivities);
  }

  recordGameFinish(game: Game, time: number) {
    let index: number;
    for (index = 0; index < this.launchActivities.length && this.launchActivities[index].time !== time; index++) {}
    this.openmsxCurrentStatus.delete(this.launchActivities[index].pid);
    this.launchActivities.splice(index, 1);
    this.launchActivitiesSubject.next(this.launchActivities);
  }

  getActivities(): LaunchActivity[] {
    return this.launchActivities;
  }

  getUpdatedActivities(): Observable<LaunchActivity[]> {
    return this.launchActivitiesSubject.asObservable();
  }

  getOpenmsxEvent(): Observable<OpenmsxEvent> {
    return this.openmsxEventSubject.asObservable();
  }

  switchDisk(pid: number, medium: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('switchDiskOnOpenmsxResponse', (event: any, switched: boolean) => {
        resolve(switched);
      });
      this.ipc.send('switchDiskOnOpenmsx', pid, medium);
    });
  }

  switchTape(pid: number, medium: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('switchTapeOnOpenmsxResponse', (event: any, switched: boolean) => {
        resolve(switched);
      });
      this.ipc.send('switchTapeOnOpenmsx', pid, medium);
    });
  }

  resetMachine(pid: number) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('resetOnOpenmsxResponse', (event: any, reset: boolean) => {
        resolve(reset);
      });
      this.ipc.send('resetOnOpenmsx', pid);
    });
  }

  takeScreenshot(pid: number, game: Game) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('takeScreenshotOnOpenmsxResponse', (event: any, taken: boolean) => {
        resolve(taken);
      });
      this.ipc.send('takeScreenshotOnOpenmsx', pid, game);
    });
  }

  saveState(pid: number, game: Game) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('saveStateOnOpenmsxResponse', (event: any, saved: boolean) => {
        resolve(saved);
      });
      this.ipc.send('saveStateOnOpenmsx', pid, game);
    });
  }

  loadState(pid: number, state: string) {
    const stateFilename = state.substring(state.lastIndexOf('/') + 1, state.lastIndexOf('.'));
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('loadStateOnOpenmsxResponse', (event: any, loaded: boolean) => {
        resolve(loaded);
      });
      this.ipc.send('loadStateOnOpenmsx', pid, stateFilename);
    });
  }

  typeText(pid: number, textToType: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('typeTextOnOpenmsxResponse', (event: any, typed: boolean) => {
        resolve(typed);
      });
      this.ipc.send('typeTextOnOpenmsx', pid, textToType);
    });
  }

  enterPassword(pid: number, password: GamePassword) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('typePasswordOnOpenmsxResponse', (event: any, typed: boolean) => {
        resolve(typed);
      });
      this.ipc.send('typePasswordOnOpenmsx', pid, password);
    });
  }

  togglePause(pid: number) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('togglePauseOnOpenmsxResponse', (event: any, success: boolean) => {
        resolve(success);
      });
      this.ipc.send('togglePauseOnOpenmsx', pid);
    });
  }

  toggleMute(pid: number) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('toggleMuteOnOpenmsxResponse', (event: any, success: boolean) => {
        resolve(success);
      });
      this.ipc.send('toggleMuteOnOpenmsx', pid);
    });
  }

  toggleFullscreen(pid: number) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once('toggleFullscreenOnOpenmsxResponse', (event: any, success: boolean) => {
        resolve(success);
      });
      this.ipc.send('toggleFullscreenOnOpenmsx', pid);
    });
  }

  getOpenmsxCurrentStatus(pid: number): Set<string> {
    return this.openmsxCurrentStatus.get(pid);
  }

  private updateOpenmsxCurrentStatus(pid: number, event: OpenmsxEvent) {
    let currentStatus = this.openmsxCurrentStatus.get(pid);
    if (!currentStatus) {
      currentStatus = new Set();
      this.openmsxCurrentStatus.set(pid, currentStatus);
    }
    if (event.on) {
      currentStatus.add(event.name);
    } else {
      currentStatus.delete(event.name);
    }
  }
}

export class LaunchActivity {
  readonly game: Game;
  readonly time: number;
  readonly pid: number;
  readonly source: EventSource;

  constructor(game: Game, time: number, pid: number, source: EventSource) {
    this.game = game;
    this.time = time;
    this.pid = pid;
    this.source = source;
  }
}

export class OpenmsxEvent {
  readonly pid: number;
  readonly name: string;
  readonly on: boolean;

  constructor(pid: number, name: string, on: boolean) {
    this.pid = pid;
    this.name = name;
    this.on = on;
  }
}

