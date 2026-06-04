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
  private eventsQueue: number[] = [];

  constructor(private launchActivityService: LaunchActivityService) {
    this.screenNumberSubscription = this.launchActivityService.getScreenNumberNotification().subscribe((screen: number) => {
      this.screen = screen;
    });
  }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      // Here's where we need to keep track of the order of events. It'll always be true first, then false for the same window.
      // These events may come in any order, e.g. when a new Window is opened and it's open event is sent before the previous
      // close is received. That's why we need to keep track of the order of events.
      if (flag) {
        this.launchActivityService.startGettingScreenNumber(this.pid);
        this.eventsQueue.push(this.pid);
      } else {
        // Always get the first event from the queue. It's the one corresponding to this close event
        const pidToStop = this.eventsQueue.shift();
        this.launchActivityService.stopGettingScreenNumber(pidToStop!);
        this.screen = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
    this.screenNumberSubscription.unsubscribe();
  }
}
