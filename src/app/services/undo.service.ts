import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Game } from '../models/game';

export enum ChangeHistoryType {DELETE, UPDATE}

export class ChangeHistory {
  oldGame: Game;
  newGame: Game;
  type: ChangeHistoryType;

  constructor(oldGame: Game, newGame: Game) {
    this.oldGame = oldGame;
    this.newGame = newGame;
    this.type = newGame ? ChangeHistoryType.UPDATE : ChangeHistoryType.DELETE;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UndoService {

  private changeHistory: ChangeHistory[] = [];
  private subject = new Subject<boolean>();

  constructor() { }

  addToHistory(oldGame: Game, newGame: Game = null) {
    this.changeHistory.push(new ChangeHistory(oldGame, newGame));
    this.subject.next(true);
  }

  getGameToRestore(): ChangeHistory {
    if (this.changeHistory.length > 0) {
      this.subject.next(this.changeHistory.length > 1);
      return this.changeHistory.pop();
    } else {
      return null;
    }
  }

  isThereUndoHistory(): boolean {
    return this.changeHistory.length > 0;
  }

  getIfTransactionsToUndo(): Observable<boolean> {
    return this.subject.asObservable();
  }
}
