import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PopupComponent } from '../popup.component';
import { LaunchActivityService, OpenmsxEvent as OpenmsxEvent } from '../../services/launch-activity.service';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-openmsx-management',
  templateUrl: './openmsx-management.component.html',
  styleUrls: ['./openmsx-management.component.sass']
})
export class OpenmsxManagementComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() pid: number;
  @Input()
  get event(): OpenmsxEvent { return this.eventInputValue; }
  set event(value: OpenmsxEvent) {
    this.eventInputValue = value;
    this.processEvents();
  }
  readonly pauseLabel: string;
  readonly unpauseLabel: string;
  readonly muteLabel: string;
  readonly unmuteLabel: string;
  readonly fullscreenLabel: string;
  readonly windowLabel: string;

  private eventInputValue: OpenmsxEvent;

  powerLed: boolean;
  capsLed: boolean;
  langLed: boolean;
  turboLed: boolean;
  fddLed: boolean;
  pauseIndicator: boolean;
  muteIndicator: boolean;
  fullscreenIndicator: boolean;
  speed: number;

  constructor(protected changeDetector: ChangeDetectorRef, private launchActivityService: LaunchActivityService,
    private localizationService: LocalizationService) {
    super(changeDetector);

    this.pauseLabel = this.localizationService.translate('dashboard.pause');
    this.unpauseLabel = this.localizationService.translate('dashboard.resume');
    this.muteLabel = this.localizationService.translate('dashboard.mute');
    this.unmuteLabel = this.localizationService.translate('dashboard.unmute');
    this.fullscreenLabel = this.localizationService.translate('dashboard.fullscreen');
    this.windowLabel = this.localizationService.translate('dashboard.exitfullscreen');
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    setTimeout(() => {
      const currentStatus = this.launchActivityService.getOpenmsxCurrentStatus(this.pid);
      if (currentStatus) {
        this.powerLed = currentStatus.get('power') === 'on';
        this.capsLed = currentStatus.get('caps') === 'on';
        this.langLed = currentStatus.get('kana') === 'on';
        this.turboLed = currentStatus.get('turbo') === 'on';
        this.fddLed = currentStatus.get('FDD') === 'on';
        this.pauseIndicator = currentStatus.get('pause') === 'true';
        this.muteIndicator = currentStatus.get('mute') === 'true';
        this.fullscreenIndicator = currentStatus.get('fullscreen') === 'true';
        this.speed = currentStatus.get('speed') ? Number(currentStatus.get('speed')) : 100;
      } else {
        this.speed = 100;
      }
    }, 0);

    super.open();
  }

  togglePause(pid: number) {
    this.pauseIndicator != this.pauseIndicator;
    this.launchActivityService.togglePause(pid).then(success => {
    });
  }

  toggleMute(pid: number) {
    this.muteIndicator != this.muteIndicator;
    this.launchActivityService.toggleMute(pid).then(success => {
    });
  }

  toggleFullscreen(pid: number) {
    this.fullscreenIndicator != this.fullscreenIndicator;
    this.launchActivityService.toggleFullscreen(pid).then(success => {
    });
  }

  resetMachine(pid: number) {
    this.launchActivityService.resetMachine(pid).then(reset => {
    });
  }

  setSpeed(pid: number) {
    this.launchActivityService.setSpeed(pid, this.speed).then(success => {
    });
  }

  private processEvents() {
    if (this.eventInputValue && this.pid === this.eventInputValue.pid) {
      if (this.eventInputValue.name === 'power') {
        this.powerLed = this.eventInputValue.value === 'on';
      } else if (this.eventInputValue.name === 'caps') {
        this.capsLed = this.eventInputValue.value === 'on';
      } else if (this.eventInputValue.name === 'kana') {
        this.langLed = this.eventInputValue.value === 'on';
      } else if (this.eventInputValue.name === 'turbo') {
        this.turboLed = this.eventInputValue.value === 'on';
      } else if (this.eventInputValue.name === 'FDD') {
        this.fddLed = this.eventInputValue.value === 'on';
      } else if (this.eventInputValue.name === 'pause') {
        this.pauseIndicator = this.eventInputValue.value === 'true';
      } else if (this.eventInputValue.name === 'mute') {
        this.muteIndicator = this.eventInputValue.value === 'true';
      } else if (this.eventInputValue.name === 'fullscreen') {
        this.fullscreenIndicator = this.eventInputValue.value === 'true';
      } else if (this.eventInputValue.name === 'speed') {
        this.speed = Number(this.eventInputValue.value);
      }
    }
  }
}
