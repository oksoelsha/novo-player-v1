import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Game } from '../models/game';

export enum ChangeHistoryType {DELETE, UPDATE}

export class ChangeHistory {
  readonly oldGame: Game;
  readonly newGame: Game | null;
  readonly type: ChangeHistoryType;

  constructor(oldGame: Game, newGame: Game | null) {
    this.oldGame = oldGame;
    this.newGame = newGame;
    this.type = newGame != null ? ChangeHistoryType.UPDATE : ChangeHistoryType.DELETE;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UndoService {

  private changeHistory: ChangeHistory[] = [];
  private subject = new Subject<boolean>();

  constructor() { }

  addToHistory(oldGame: Game, newGame: Game | null = null) {
    this.changeHistory.push(new ChangeHistory(oldGame, newGame));
    this.subject.next(true);
  }

  getGameToRestore(): ChangeHistory | undefined {
    if (this.changeHistory.length > 0) {
      this.subject.next(this.changeHistory.length > 1);
      return this.changeHistory.pop();
    } else {
      return undefined;
    }
  }

  isThereUndoHistory(): boolean {
    return this.changeHistory.length > 0;
  }

  getIfTransactionsToUndo(): Observable<boolean> {
    return this.subject.asObservable();
  }
}
