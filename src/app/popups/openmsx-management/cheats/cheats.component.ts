import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LaunchActivityService } from '../../../services/launch-activity.service';
import { Game } from '../../../models/game';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-openmsx-management-cheats',
  templateUrl: './cheats.component.html',
  styleUrls: ['../../../common-styles.sass', '../openmsx-management.component.sass', './cheats.component.sass']
})
export class CheatsComponent implements OnInit, OnDestroy {

  @Input() pid: number;
  @Input() game: Game;
  @Input() events: Observable<boolean>;
  @Input() trainersList: any[];
  @Output() alertMessage: EventEmitter<string> = new EventEmitter<string>();

  private eventsSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService, private localizationService: LocalizationService) { }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (!flag) {
        this.trainersList = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
  }

  setCheat(cheat: any) {
    cheat.on = !cheat.on;
    this.launchActivityService.setCheat(this.pid, this.game.title, cheat.label).then((success: boolean) => {
      if (success) {
        if (cheat.on) {
          this.alertMessage.emit(this.localizationService.translate('dashboard.cheatenabled'));
        } else {
          this.alertMessage.emit(this.localizationService.translate('dashboard.cheatdisabled'));
        }
      }
    });
  }

  setAllCheats(flag: boolean) {
    this.trainersList = this.trainersList.map(cheat => {
      cheat.on = flag;
      return cheat;
    });
    this.launchActivityService.setAllCheats(this.pid, this.game.title, flag).then((success: boolean) => {
      if (success) {
        if (flag) {
          this.alertMessage.emit(this.localizationService.translate('dashboard.cheatsallenabled'));
        } else {
          this.alertMessage.emit(this.localizationService.translate('dashboard.cheatsalldisabled'));
        }
      }
    });
  }
}
