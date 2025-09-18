import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LaunchActivityService } from '../../../services/launch-activity.service';

@Component({
  selector: 'app-openmsx-management-detected-sound-chips',
  templateUrl: './detected-sound-chips.component.html',
  styleUrls: ['../openmsx-management.component.sass', './detected-sound-chips.component.sass']
})
export class DetectedSoundChipsComponent implements OnInit, OnDestroy {

  @Input() pid: number;
  @Input() events: Observable<boolean>;
  detected: string[] = [];
  inUse: boolean[] = [];
  private readonly soundChips = ['PSG', 'SCC', 'SCC-I', 'PCM', 'MSX-MUSIC', 'MSX-AUDIO', 'Moonsound', 'MIDI'];
  private eventsSubscription: Subscription;
  private soundChipsSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService) {
    this.soundChipsSubscription = this.launchActivityService.getSoundChipsNotification().subscribe((soundChips: any) => {
      this.decodeSoundChips(soundChips.detected, soundChips.currentlyUsed);
    });
  }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (flag) {
        this.launchActivityService.startGettingDetectedSoundChips(this.pid);
      } else {
        this.launchActivityService.stopGettingDetectedSoundChips(this.pid);
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
