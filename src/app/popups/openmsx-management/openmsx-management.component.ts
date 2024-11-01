import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupComponent } from '../popup.component';
import { LaunchActivityService, OpenmsxEvent as OpenmsxEvent } from '../../services/launch-activity.service';
import { LocalizationService } from '../../services/localization.service';
import { Subscription } from 'rxjs';
import { Game } from '../../models/game';
import { GameSavedState } from '../../models/saved-state';
import { GamesService } from '../../services/games.service';
import { FilesService } from '../../services/files.service';
import { Utils } from '../../models/utils';

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
  savedStates: GameSavedState[] = [];
  fileGroup: string[] = [];
  screen: number;

  readonly pauseLabel: string;
  readonly unpauseLabel: string;
  readonly muteLabel: string;
  readonly unmuteLabel: string;
  readonly fullscreenLabel: string;
  readonly windowLabel: string;
  readonly defaultSpeed = 100;

  private openmsxEventSubscription: Subscription;
  private screenNumberSubscription: Subscription;
  private readonly acceptedSpeeds = new Set([50, 100, 150, 200, 250, 300]);

  constructor(protected changeDetector: ChangeDetectorRef, private launchActivityService: LaunchActivityService,
    private localizationService: LocalizationService, private gamesService: GamesService, private filesService: FilesService) {
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
    this.screenNumberSubscription = this.launchActivityService.getScreenNumberNotification().subscribe((screen: number) => {
      self.screen = screen;
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
    this.screenNumberSubscription.unsubscribe();
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

      this.setSavedStates();
      this.setFileGroup();
      this.launchActivityService.startGettingScreenNumber(this.pid);
    }, 0);

    super.open();
  }

  close(): void {
    super.close(() => {
      this.screen = null;
      this.launchActivityService.stopGettingScreenNumber(this.pid);
    });
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
      super.alert(this.localizationService.translate('dashboard.screenshottaken'));
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

  saveState(pid: number, game: Game) {
    this.launchActivityService.saveState(pid, game).then(saved => {
      if (saved) {
        super.alert(this.localizationService.translate('dashboard.statesaved'));
        this.setSavedStates();
      }
    });
  }

  loadState(gameState: GameSavedState) {
    this.launchActivityService.loadState(this.pid, gameState.state).then(loaded => {
      if (loaded) {
        super.alert(this.localizationService.translate('dashboard.stateloaded'));
      }
    });
  }

  getSavedStateTimeAndDate(savedState: GameSavedState): string {
    const timestamp = savedState.state.substring(savedState.state.lastIndexOf('-') + 1, savedState.state.lastIndexOf('.'));
    return new Date(+timestamp).toLocaleString();
  }

  getMediumDisplayName(medium: string) {
    let separatorIndex = medium.lastIndexOf('\\');
    if (separatorIndex < 0) {
      separatorIndex = medium.lastIndexOf('/');
    }
    return Utils.compressStringIfTooLong(medium.substring(separatorIndex + 1, medium.lastIndexOf('.')));
  }

  isMediumCanHaveGroup(game: Game): boolean {
    return this.isDisk(game) || this.isTape(game);
  }

  switchMedium(pid: number, game: Game, medium: string) {
    if (this.isDisk(game)) {
      this.launchActivityService.switchDisk(pid, medium).then(switched => {
        if (switched) {
          super.alert(this.localizationService.translate('dashboard.diskswitched'));
        }
      });
    } else {
      this.launchActivityService.switchTape(pid, medium).then(switched => {
        if (switched) {
          super.alert(this.localizationService.translate('dashboard.tapeswitched'));
        }
      });
    }
  }

  isDisk(game: Game) {
    return game.romA == null && game.diskA != null;
  }

  isTape(game: Game) {
    return game.romA == null && game.diskA == null && game.tape != null;
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

  private setSavedStates() {
    this.gamesService.getGameSavedStates(this.game).then((savedStates: GameSavedState[]) => {
      this.savedStates = savedStates;
    });
  }

  private setFileGroup() {
    let medium: string;
    if (this.isDisk(this.game)) {
      medium = this.game.diskA;
    } else if (this.isTape(this.game)) {
      medium = this.game.tape;
    } else {
      medium = null;
    }
    if (medium) {
      this.filesService.getFileGroup(this.pid, medium).then((fileGroup: string[]) => {
        this.fileGroup = fileGroup;
      });
    }
  }
}
