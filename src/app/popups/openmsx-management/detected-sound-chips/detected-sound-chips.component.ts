import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LaunchActivityService } from '../../../services/launch-activity.service';

@Component({
  selector: 'app-openmsx-management-detected-sound-chips',
  templateUrl: './detected-sound-chips.component.html',
  styleUrls: ['../openmsx-management.component.sass', './detected-sound-chips.component.sass']
})
export class DetectedSoundChipsComponent implements OnInit, OnDestroy {

  @Input() pid!: number;
  @Input() events!: Observable<boolean>;
  detected: string[] = [];
  inUse: boolean[] = [];
  private readonly soundChips = ['PSG', 'SCC', 'SCC-I', 'PCM', 'MSX-MUSIC', 'MSX-AUDIO', 'Moonsound', 'MIDI'];
  private eventsSubscription!: Subscription;
  private soundChipsSubscription: Subscription;
  private eventsQueue: number[] = [];

  constructor(private launchActivityService: LaunchActivityService) {
    this.soundChipsSubscription = this.launchActivityService.getSoundChipsNotification().subscribe((soundChips: any) => {
      this.decodeSoundChips(soundChips.detected, soundChips.currentlyUsed);
    });
  }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      // Here's where we need to keep track of the order of events. It'll always be true first, then false for the same window.
      // These events may come in any order, e.g. when a new Window is opened and it's open event is sent before the previous
      // close is received. That's why we need to keep track of the order of events.
      if (flag) {
        this.launchActivityService.startGettingDetectedSoundChips(this.pid);
        this.eventsQueue.push(this.pid);
      } else {
        // Always get the first event from the queue. It's the one corresponding to this close event
        const pidToStop = this.eventsQueue.shift();
        this.launchActivityService.stopGettingDetectedSoundChips(pidToStop!);
        this.detected = [];
        this.inUse = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
    this.soundChipsSubscription.unsubscribe();
  }

  private decodeSoundChips(soundChips: number, currentlyUsed: number) {
    this.detected = [];
    this.inUse = [];
    for (let index = 0; index < this.soundChips.length; index++) {
      const bit = 1 << index;
      if (soundChips & bit) {
        this.detected.push(this.soundChips[index]);
        this.inUse.push((currentlyUsed & bit) > 0);
      }
    }
  }
}
