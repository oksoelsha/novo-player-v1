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
  private subject = new Subject<void>();

  constructor(private operationCacheService: OperationCacheService) {
    this.ipc = window.require('electron').ipcRenderer;
  }

  scan(parameters: ScanParameters): Promise<Game[]> {
    return new Promise<Game[]>((resolve, reject) => {
      this.ipc.once('scanResponse', (event, addedGames: Game[]) => {
        if (addedGames.length > 0) {
          this.subject.next();
        }

        for (const game of addedGames) {
          this.operationCacheService.cacheAddOperation(game);
        }

        resolve(addedGames);
      });
      this.ipc.send('scan', parameters.items, parameters.listing, parameters.machine);
    });
  }

  getScannerFinishedEvent(): Observable<void> {
    return this.subject.asObservable();
  }
}
