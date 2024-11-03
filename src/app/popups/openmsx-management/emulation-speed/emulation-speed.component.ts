import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LaunchActivityService, OpenmsxEvent } from '../../../services/launch-activity.service';

@Component({
  selector: 'app-openmsx-management-emulation-speed',
  templateUrl: './emulation-speed.component.html',
  styleUrls: ['./emulation-speed.component.sass']
})
export class EmulationSpeedComponent implements OnInit, OnDestroy {

  @Input() pid: number;
  @Input() currentStatus: Map<String, string>;
  @Input() events: Observable<boolean>;

  speed: number;
  speedDisable: boolean;

  private readonly acceptedSpeeds = new Set([50, 100, 150, 200, 250, 300]);
  private readonly defaultSpeed = 100;
  private openmsxEventSubscription: Subscription;
  private eventsSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService) {
    this.openmsxEventSubscription = this.launchActivityService.getOpenmsxEvent().subscribe(openmsxEvent => {
      this.processEvents(openmsxEvent);
    });
  }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (flag) {
        setTimeout(() => {
          if (this.currentStatus) {
            this.initSpeedValue();
          } else {
            this.speed = this.defaultSpeed;
          }
        }, 0);
      }
    });
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
    this.openmsxEventSubscription.unsubscribe();
  }

  setSpeed() {
    this.launchActivityService.setSpeed(this.pid, this.speed).then(success => {
    });
  }

  resetSpeed() {
    this.launchActivityService.setSpeed(this.pid, this.defaultSpeed).then(success => {
      this.speed = this.defaultSpeed;
    });
  }

  private initSpeedValue() {
    const value = this.currentStatus.get('speed');
    if (!value) {
      this.speed = this.defaultSpeed;
    } else {
      this.speed = Number(this.currentStatus.get('speed'));
      this.speedDisable = !this.acceptedSpeeds.has(this.speed);
    }
  }

  private processEvents(openmsxEvent: OpenmsxEvent) {
    if (openmsxEvent?.pid === this.pid) {
      if (openmsxEvent.name === 'speed') {
        this.speed = Number(openmsxEvent.value);
        this.speedDisable = !this.acceptedSpeeds.has(this.speed);
      }
    }
  }
}
