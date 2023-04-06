import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';
import { Game } from '../models/game';
import { ScanParameters } from '../popups/scan-parameters/scan-parameters.component';
import { OperationCacheService } from './operation-cache.service';

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private ipc: IpcRenderer;
  private scanEndSubject = new Subject<number>();
  private scanProgressSubject = new Subject<string>();

  constructor(private operationCacheService: OperationCacheService) {
    this.ipc = window.require('electron').ipcRenderer;

    this.ipc.on('scanProgress', (event, currentCount: number, total: number) => {
      const percentage = ((100 * currentCount) / total).toFixed(0);
      this.scanProgressSubject.next(percentage);
    });
  }

  scan(parameters: ScanParameters): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ipc.once('scanResponse', (event, addedGames: Game[]) => {
        this.scanEndSubject.next(addedGames.length);
        for (const game of addedGames) {
          this.operationCacheService.cacheAddOperation(game);
        }
        sessionStorage.removeItem('scanRunning');
        resolve();
      });
      this.ipc.send('scan', parameters.items, parameters.listing, parameters.machine);
    });
  }

  getScannerFinishedEvent(): Observable<number> {
    return this.scanEndSubject.asObservable();
  }

  getScannerProgressEvent(): Observable<string> {
    return this.scanProgressSubject.asObservable();
  }
}
