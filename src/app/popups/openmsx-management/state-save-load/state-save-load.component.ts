import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GamesService } from '../../../services/games.service';
import { GameSavedState } from '../../../models/saved-state';
import { Game } from '../../../models/game';
import { LaunchActivityService } from '../../../services/launch-activity.service';
import { Observable, Subscription } from 'rxjs';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-openmsx-management-state-save-load',
  templateUrl: './state-save-load.component.html',
  styleUrls: ['../../../common-styles.sass', '../openmsx-management.component.sass', './state-save-load.component.sass']
})
export class StateSaveLoadComponent implements OnInit, OnDestroy {

  @Input() pid: number;
  @Input() game: Game;
  @Input() events: Observable<boolean>;
  @Output() alertMessage: EventEmitter<string> = new EventEmitter<string>();

  savedStates: GameSavedState[] = [];
  private eventsSubscription: Subscription;

  constructor(private gamesService: GamesService, private launchActivityService: LaunchActivityService,
    private localizationService: LocalizationService) { }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (flag) {
        this.setSavedStates();
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
  }

  saveState() {
    this.launchActivityService.saveState(this.pid, this.game).then(saved => {
      if (saved) {
        this.alertMessage.emit(this.localizationService.translate('dashboard.statesaved'));
        this.setSavedStates();
      }
    });
  }

  loadState(gameState: GameSavedState) {
    this.launchActivityService.loadState(this.pid, gameState.state).then(loaded => {
      if (loaded) {
        this.alertMessage.emit(this.localizationService.translate('dashboard.stateloaded'));
      }
    });
  }

  getSavedStateTimeAndDate(savedState: GameSavedState): string {
    const timestamp = savedState.state.substring(savedState.state.lastIndexOf('-') + 1, savedState.state.lastIndexOf('.'));
    return new Date(+timestamp).toLocaleString();
  }

  private setSavedStates() {
    this.gamesService.getGameSavedStates(this.game).then((savedStates: GameSavedState[]) => {
      this.savedStates = savedStates;
    });
  }
}
