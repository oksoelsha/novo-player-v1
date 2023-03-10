import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from '../../models/game';
import { GameSavedState } from '../../models/saved-state';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-saved-states',
  templateUrl: './saved-states.component.html',
  styleUrls: ['../../common-styles.sass', './saved-states.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedStatesComponent  extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @Input() savedStates: GameSavedState[];
  @Input() hideNormalStart: boolean;
  @Output() startNormallyChoice: EventEmitter<Game> = new EventEmitter<Game>();
  @Output() startWithStateChoice: EventEmitter<string> = new EventEmitter<string>();

  constructor(protected changeDetector: ChangeDetectorRef) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    super.open();
  }

  getSavedStateTimeAndDate(savedState: GameSavedState): string {
    const timestamp = this.getTimestamp(savedState);
    return new Date(+timestamp).toLocaleString();
  }

  startNormally() {
    this.startNormallyChoice.emit(this.game);
    this.close();
  }

  startWithState(savedState: GameSavedState) {
    this.startWithStateChoice.emit(savedState.state);
    this.close();
  }

  private getTimestamp(savedState: GameSavedState): string {
    return savedState.state.substring(savedState.state.lastIndexOf('-') + 1, savedState.state.lastIndexOf('.'));
  }
}
