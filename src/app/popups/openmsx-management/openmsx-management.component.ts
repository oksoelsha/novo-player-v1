import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupComponent } from '../popup.component';
import { LaunchActivityService, OpenmsxEvent as OpenmsxEvent } from '../../services/launch-activity.service';
import { LocalizationService } from '../../services/localization.service';
import { Subscription } from 'rxjs';
import { Game } from '../../models/game';

@Component({
  selector: 'app-openmsx-management',
  templateUrl: './openmsx-management.component.html',
  styleUrls: ['../../common-styles.sass', './openmsx-management.component.sass']
})
export class OpenmsxManagementComponent extends PopupComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() popupId: string;
  @Input() pid: number;
  @Input() game: Game;

  capsLed: boolean;
  langLed: boolean;
  turboLed: boolean;
  fddLed: boolean;
  pauseIndicator: boolean;
  muteIndicator: boolean;
  fullscreenIndicator: boolean;
  speed: number;
  speedDisable: boolean;

  readonly pauseLabel: string;
  readonly unpauseLabel: string;
  readonly muteLabel: string;
  readonly unmuteLabel: string;
  readonly fullscreenLabel: string;
  readonly windowLabel: string;
  readonly defaultSpeed = 100;

  private openmsxEventSubscription: Subscription;
  private readonly acceptedSpeeds = new Set([50, 100, 150, 200, 250, 300]);

  constructor(protected changeDetector: ChangeDetectorRef, private launchActivityService: LaunchActivityService,
    private localizationService: LocalizationService) {
    super(changeDetector);
    const self = this;

    this.pauseLabel = this.localizationService.translate('dashboard.pause');
    this.unpauseLabel = this.localizationService.translate('dashboard.resume');
    this.muteLabel = this.localizationService.translate('dashboard.mute');
    this.unmuteLabel = this.localizationService.translate('dashboard.unmute');
    this.fullscreenLabel = this.localizationService.translate('dashboard.fullscreen');
    this.windowLabel = this.localizationService.translate('dashboard.exitfullscreen');
    this.openmsxEventSubscription = this.launchActivityService.getOpenmsxEvent().subscribe(openmsxEvent => {
      self.processEvents(openmsxEvent);
    });
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  ngOnDestroy() {
    this.openmsxEventSubscription.unsubscribe();
  }

  async open(): Promise<void> {
    setTimeout(() => {
      const currentStatus = this.launchActivityService.getOpenmsxCurrentStatus(this.pid);
      if (currentStatus) {
        this.capsLed = currentStatus.get('caps') === 'on';
        this.langLed = currentStatus.get('kana') === 'on';
        this.turboLed = currentStatus.get('turbo') === 'on';
        this.fddLed = currentStatus.get('FDD') === 'on';
        this.pauseIndicator = currentStatus.get('pause') === 'true';
        this.muteIndicator = currentStatus.get('mute') === 'true';
        this.fullscreenIndicator = currentStatus.get('fullscreen') === 'true';
        this.initSpeedValue(currentStatus);
      } else {
        this.capsLed = false;
        this.langLed = false;
        this.turboLed = false;
        this.fddLed = false;
        this.pauseIndicator = false;
        this.muteIndicator = false;
        this.fullscreenIndicator = false;
        this.speed = this.defaultSpeed;
      }
    }, 0);

    super.open();
  }

  initSpeedValue(currentStatus: Map<string, string>) {
    const value = currentStatus.get('speed');
    if (!value) {
      this.speed = this.defaultSpeed;
    } else {
      this.speed = Number(currentStatus.get('speed'));
      this.speedDisable = !this.acceptedSpeeds.has(this.speed);
    }
  }

  togglePause(pid: number) {
    this.pauseIndicator = !this.pauseIndicator;
    this.launchActivityService.togglePause(pid).then(success => {
    });
  }

  toggleMute(pid: number) {
    this.muteIndicator = !this.muteIndicator;
    this.launchActivityService.toggleMute(pid).then(success => {
    });
  }

  toggleFullscreen(pid: number) {
    this.fullscreenIndicator = !this.fullscreenIndicator;
    this.launchActivityService.toggleFullscreen(pid).then(success => {
    });
  }

  takeScreenshot(pid: number, game: Game) {
    this.launchActivityService.takeScreenshot(pid, game).then(success => {
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

  resetSpeed(pid: number) {
    this.launchActivityService.setSpeed(pid, this.defaultSpeed).then(success => {
      this.speed = this.defaultSpeed;
    });
  }

  private processEvents(openmsxEvent: OpenmsxEvent) {
    if (openmsxEvent?.pid === this.pid) {
      if (openmsxEvent.name === 'caps') {
        this.capsLed = openmsxEvent.value === 'on';
      } else if (openmsxEvent.name === 'kana') {
        this.langLed = openmsxEvent.value === 'on';
      } else if (openmsxEvent.name === 'turbo') {
        this.turboLed = openmsxEvent.value === 'on';
      } else if (openmsxEvent.name === 'FDD') {
        this.fddLed = openmsxEvent.value === 'on';
      } else if (openmsxEvent.name === 'pause') {
        this.pauseIndicator = openmsxEvent.value === 'true';
      } else if (openmsxEvent.name === 'mute') {
        this.muteIndicator = openmsxEvent.value === 'true';
      } else if (openmsxEvent.name === 'fullscreen') {
        this.fullscreenIndicator = openmsxEvent.value === 'true';
      } else if (openmsxEvent.name === 'speed') {
        this.speed = Number(openmsxEvent.value);
        this.speedDisable = !this.acceptedSpeeds.has(this.speed);
      }
    }
  }
}
