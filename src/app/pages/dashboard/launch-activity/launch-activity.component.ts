import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventSource } from '../../../models/event';
import { Game } from '../../../models/game';
import { FilesService } from '../../../services/files.service';
import { GamesService } from '../../../services/games.service';
import { LaunchActivity, LaunchActivityService } from '../../../services/launch-activity.service';
import { LocalizationService } from '../../../services/localization.service';
import { PlatformService } from '../../../services/platform.service';
import { AlertsService } from '../../../shared/components/alerts/alerts.service';
import { TypeTextComponent as TypeTextComponent } from '../../../popups/type-text/type-text.component';
import { GamePasswordsInfo } from '../../../models/game-passwords-info';
import { PickPasswordComponent } from '../../../popups/pick-password/pick-password.component';
import { OpenmsxManagementComponent as OpenmsxManagementComponent } from '../../../popups/openmsx-management/openmsx-management.component';
import { EnableCheatsComponent } from '../../../popups/enable-cheats/enable-cheats.component';

@Component({
  selector: 'app-dashboard-launch-activity-card',
  templateUrl: './launch-activity.component.html',
  styleUrls: ['../../../common-styles.sass', '../dashboard.component.sass', './launch-activity.component.sass']
})
export class LaunchActivityComponent implements OnInit, OnDestroy {

  @ViewChild('openmsxManagementInterface') openmsxManagementInterface: OpenmsxManagementComponent;
  @ViewChild('typeTextInterface') typeTextInterface: TypeTextComponent;
  @ViewChild('passwordSelector') pickPasswordInterface: PickPasswordComponent;
  @ViewChild('trainerInterface') enableCheatsInterface: EnableCheatsComponent;
  readonly isWindows = this.platformService.isOnWindows();
  launchActivities: LaunchActivity[] = [];
  gamePasswordsMap: Map<number, GamePasswordsInfo> = new Map();
  gameTrainersSet: Set<number> = new Set();
  selectedGame: Game;
  selectedPid: number;
  gamePasswords: GamePasswordsInfo;
  private launchActivitySubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService, private alertService: AlertsService,
    private localizationService: LocalizationService, private platformService: PlatformService,
    private filesService: FilesService, private gamesService: GamesService) {
    const self = this;
    this.launchActivitySubscription = this.launchActivityService.getUpdatedActivities().subscribe(launchActivity => {
      self.launchActivities = launchActivity;
      if (!launchActivity.find(l => l.pid === this.selectedPid)) {
        this.typeTextInterface.close();
        this.pickPasswordInterface.close();
        this.openmsxManagementInterface.close();
        this.enableCheatsInterface.close();
        this.gameTrainersSet.delete(this.selectedPid);
      }
    });
    this.launchActivities = launchActivityService.getActivities();
  }

  ngOnInit(): void {
    this.launchActivities.forEach(activity => {
      this.setPasswords(activity);
      this.doesTrainerExist(activity);
    });
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

  typeText(pid: number, game: Game) {
    this.selectedPid = pid;
    this.selectedGame = game;
    this.typeTextInterface.open();
  }

  pickPassword(pid: number, game: Game) {
    this.selectedPid = pid;
    this.selectedGame = game;
    this.gamePasswords = this.gamePasswordsMap.get(game.generationMSXId);
    this.pickPasswordInterface.open();
  }

  showTrainer(pid: number, game: Game) {
    this.selectedPid = pid;
    this.selectedGame = game;
    this.enableCheatsInterface.open();
  }

  openManagement(pid: number, game: Game) {
    this.selectedPid = pid;
    this.selectedGame = game;
    this.openmsxManagementInterface.open();
  }

  private setPasswords(activity: any) {
    this.gamesService.getGamePasswords(activity.game).then((gamePasswordsInfo: GamePasswordsInfo) => {
      if (gamePasswordsInfo) {
        this.gamePasswordsMap.set(activity.game.generationMSXId, gamePasswordsInfo);
      }
    });
  }

  private doesTrainerExist(activity: any) {
    this.launchActivityService.getTrainer(activity.pid, activity.game.title).then((trainersList: any[]) => {
      if (trainersList.length > 0) {
        this.gameTrainersSet.add(activity.pid);
      }
    });
  }
}
