import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupComponent } from '../popup.component';
import { LaunchActivityService, OpenmsxEvent as OpenmsxEvent } from '../../services/launch-activity.service';
import { LocalizationService } from '../../services/localization.service';
import { Subject, Subscription } from 'rxjs';
import { Game } from '../../models/game';
import { GamesService } from '../../services/games.service';
import { FilesService } from '../../services/files.service';
import { Utils } from '../../models/utils';
import { GamePasswordsInfo } from '../../models/game-passwords-info';

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
  fileGroup: string[] = [];
  openEventSubject: Subject<boolean> = new Subject<boolean>();
  currentStatus: Map<string, string>;
  gamePasswordsInfo: GamePasswordsInfo;
  trainersList: any[];

  readonly pauseLabel: string;
  readonly unpauseLabel: string;
  readonly muteLabel: string;
  readonly unmuteLabel: string;
  readonly fullscreenLabel: string;
  readonly windowLabel: string;

  private openmsxEventSubscription: Subscription;

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
      this.currentStatus = this.launchActivityService.getOpenmsxCurrentStatus(this.pid);
      if (this.currentStatus) {
        this.capsLed = this.currentStatus.get('caps') === 'on';
        this.langLed = this.currentStatus.get('kana') === 'on';
        this.turboLed = this.currentStatus.get('turbo') === 'on';
        this.fddLed = this.currentStatus.get('FDD') === 'on';
        this.pauseIndicator = this.currentStatus.get('pause') === 'true';
        this.muteIndicator = this.currentStatus.get('mute') === 'true';
        this.fullscreenIndicator = this.currentStatus.get('fullscreen') === 'true';
      } else {
        this.capsLed = false;
        this.langLed = false;
        this.turboLed = false;
        this.fddLed = false;
        this.pauseIndicator = false;
        this.muteIndicator = false;
        this.fullscreenIndicator = false;
      }

      this.setFileGroup();
      this.setPasswords();
      this.setTrainer();
      this.openEventSubject.next(true);
    }, 0);

    super.open();
  }

  close(): void {
    super.close(() => {
      this.openEventSubject.next(false);
    });
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
      if (reset) {
        super.alert(this.localizationService.translate('dashboard.wasreset'));        
      }
    });
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

  alertMessage(message: string) {
    super.alert(message);
  }

  private setPasswords() {
    this.gamesService.getGamePasswords(this.game).then((gamePasswordsInfo) => {
      this.gamePasswordsInfo = gamePasswordsInfo;
    });
  }

  private setTrainer() {
    this.launchActivityService.getTrainer(this.pid, this.game.title).then((trainersList: any[]) => {
      this.trainersList = trainersList;
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
      }
    }
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
