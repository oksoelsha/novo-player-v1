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
  soundChips: string[] = [];
  private eventsSubscription: Subscription;
  private soundChipsSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService) {
    this.soundChipsSubscription = this.launchActivityService.getDetectedSoundChipsNotification().subscribe((soundChips: number) => {
      this.decodeSoundChips(soundChips);
    });
  }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (flag) {
        this.launchActivityService.startGettingDetectedSoundChips(this.pid);
      } else {
        this.launchActivityService.stopGettingDetectedSoundChips(this.pid);
        this.soundChips = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
    this.soundChipsSubscription.unsubscribe();
  }

  private decodeSoundChips(soundChips: number) {
    this.soundChips = [];
    if (soundChips & 1) this.soundChips.push('PSG');
    if (soundChips & 2) this.soundChips.push('SCC');
    if (soundChips & 4) this.soundChips.push('SCC-I');
    if (soundChips & 8) this.soundChips.push('PCM');
    if (soundChips & 16) this.soundChips.push('MSX-MUSIC');
    if (soundChips & 32) this.soundChips.push('MSX-AUDIO');
    if (soundChips & 64) this.soundChips.push('Moonsound');
  }
}
