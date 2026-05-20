import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LaunchActivityService } from '../../../services/launch-activity.service';

@Component({
  selector: 'app-openmsx-management-screen-number',
  templateUrl: './screen-number.component.html',
  styleUrls: ['../openmsx-management.component.sass', './screen-number.component.sass']
})
export class ScreenNumberComponent implements OnInit, OnDestroy {

  @Input() pid!: number;
  @Input() events!: Observable<boolean>;
  screen: number | undefined;
  private eventsSubscription!: Subscription;
  private screenNumberSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService) {
    this.screenNumberSubscription = this.launchActivityService.getScreenNumberNotification().subscribe((screen: number) => {
      this.screen = screen;
    });
  }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (flag) {
        this.launchActivityService.startGettingScreenNumber(this.pid);
      } else {
        this.launchActivityService.stopGettingScreenNumber(this.pid);
        this.screen = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
    this.screenNumberSubscription.unsubscribe();
  }
}
