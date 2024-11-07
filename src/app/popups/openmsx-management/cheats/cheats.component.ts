import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LaunchActivityService } from '../../../services/launch-activity.service';
import { Game } from '../../../models/game';

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

  private eventsSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService) { }

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
    });
  }

  setAllCheats(flag: boolean) {
    this.trainersList = this.trainersList.map(cheat => {
      cheat.on = flag;
      return cheat;
    });
    this.launchActivityService.setAllCheats(this.pid, this.game.title, flag).then((success: boolean) => {
    });
  }
}
