import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventSource } from '../../../models/event';
import { Game } from '../../../models/game';
import { LaunchActivity, LaunchActivityService } from '../../../services/launch-activity.service';
import { PlatformService } from '../../../services/platform.service';
import { OpenmsxManagementComponent as OpenmsxManagementComponent } from '../../../popups/openmsx-management/openmsx-management.component';

@Component({
  selector: 'app-dashboard-launch-activity-card',
  templateUrl: './launch-activity.component.html',
  styleUrls: ['../../../common-styles.sass', '../dashboard.component.sass', './launch-activity.component.sass']
})
export class LaunchActivityComponent implements OnDestroy {

  @ViewChild('openmsxManagementInterface') openmsxManagementInterface: OpenmsxManagementComponent;
  readonly isWindows = this.platformService.isOnWindows();
  launchActivities: LaunchActivity[] = [];
  selectedGame: Game;
  selectedPid: number;
  private launchActivitySubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService,  private platformService: PlatformService) {
    const self = this;
    this.launchActivitySubscription = this.launchActivityService.getUpdatedActivities().subscribe(launchActivity => {
      self.launchActivities = launchActivity;
      if (!launchActivity.find(l => l.pid === this.selectedPid)) {
        this.openmsxManagementInterface.close();
      }
    });
    this.launchActivities = launchActivityService.getActivities();
  }

  ngOnDestroy() {
    this.launchActivitySubscription.unsubscribe();
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

  openManagement(pid: number, game: Game) {
    this.selectedPid = pid;
    this.selectedGame = game;
    this.openmsxManagementInterface.open();
  }
}
