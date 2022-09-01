import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventSource } from '../../../models/event';
import { Game } from '../../../models/game';
import { FilesService } from '../../../services/files.service';
import { LaunchActivity, LaunchActivityService } from '../../../services/launch-activity.service';
import { LocalizationService } from '../../../services/localization.service';
import { PlatformService } from '../../../services/platform.service';
import { AlertsService } from '../../../shared/components/alerts/alerts.service';

@Component({
  selector: 'app-dashboard-launch-activity-card',
  templateUrl: './launch-activity.component.html',
  styleUrls: ['../../../common-styles.sass', '../dashboard.component.sass', './launch-activity.component.sass']
})
export class LaunchActivityComponent implements OnInit, OnDestroy {

  readonly isWindows = this.platformService.isOnWindows();
  launchActivities: LaunchActivity[] = [];
  fileGroupMap: Map<number, string[]> = new Map();
  private launchActivitySubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService, private alertService: AlertsService,
    private localizationService: LocalizationService, private platformService: PlatformService, private filesService: FilesService) {
    const self = this;
    this.launchActivitySubscription = this.launchActivityService.getUpdatedActivities().subscribe(launchActivity => {
      self.launchActivities = launchActivity;
    });
    this.launchActivities = launchActivityService.getActivities();
  }

  ngOnInit(): void {
    this.launchActivities.forEach(activity => {
      let medium: string;
      if (this.isDisk(activity.game)) {
        medium = activity.game.diskA;
      } else if (this.isTape(activity.game)) {
        medium = activity.game.tape;
      } else {
        medium = null;
      }
      if (medium) {
        this.filesService.getFileGroup(activity.pid, medium).then((fileGroup: string[]) => {
          this.fileGroupMap.set(activity.pid, fileGroup);
        });
      }
    });
  }

  ngOnDestroy() {
    this.launchActivitySubscription.unsubscribe();
  }

  getMediumDisplayName(medium: string) {
    let separatorIndex = medium.lastIndexOf('\\');
    if (separatorIndex < 0) {
      separatorIndex = medium.lastIndexOf('/');
    }
    return medium.substring(separatorIndex + 1, medium.lastIndexOf('.'));
  }

  isMediumCanHaveGroup(game: Game): boolean {
    return this.isDisk(game) || this.isTape(game);
  }

  getTimeDisplay(time: number): string {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = '0' + date.getMinutes();
    const seconds = '0' + date.getSeconds();

    return hours + ':' + minutes.substring(-2) + ':' + seconds.substring(-2);
  }

  getLaunchSource(source: number): string {
    return EventSource[source];
  }

  isRunningOnOpenMSX(launchActivity: LaunchActivity): boolean {
    return launchActivity.source === EventSource.openMSX;
  }

  resetMachine(pid: number, game: Game) {
    this.launchActivityService.resetMachine(pid).then(reset => {
      if (reset) {
        this.alertService.success(this.localizationService.translate('dashboard.reset') + ': ' +
          game.name + ' [' + game.listing + ']');
      }
    });
  }

  switchMedium(pid: number, game: Game, medium: string) {
    if (this.isDisk(game)) {
      this.launchActivityService.switchDisk(pid, medium).then(switched => {
        if (switched) {
          this.alertService.success(this.localizationService.translate('dashboard.diskswitched') + ': ' +
            this.getMediumDisplayName(medium));
        }
      });
    } else {
      this.launchActivityService.switchTape(pid, medium).then(switched => {
        if (switched) {
          this.alertService.success(this.localizationService.translate('dashboard.tapeswitched') + ': ' +
            this.getMediumDisplayName(medium));
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

  takeScreenshot(pid: number, game: Game) {
    this.launchActivityService.takeScreenshot(pid, game).then(taken => {
      if (taken) {
        this.alertService.success(this.localizationService.translate('dashboard.screenshottaken') + ': ' +
          game.name + ' [' + game.listing + ']');
      }
    });
  }
}
