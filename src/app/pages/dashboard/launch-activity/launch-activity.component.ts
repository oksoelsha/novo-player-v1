import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventSource } from '../../../models/event';
import { Game } from '../../../models/game';
import { GameSavedState } from '../../../models/saved-state';
import { SavedStatesComponent } from '../../../popups/saved-states/saved-states.component';
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
  @ViewChild('savedStatesSelector') savedStatesSelector: SavedStatesComponent;
  @ViewChild('typeTextInterface') typeTextInterface: TypeTextComponent;
  @ViewChild('passwordSelector') pickPasswordInterface: PickPasswordComponent;
  @ViewChild('trainerInterface') enableCheatsInterface: EnableCheatsComponent;
  readonly isWindows = this.platformService.isOnWindows();
  launchActivities: LaunchActivity[] = [];
  fileGroupMap: Map<number, string[]> = new Map();
  savedStatesMap: Map<string, GameSavedState[]> = new Map();
  gamePasswordsMap: Map<number, GamePasswordsInfo> = new Map();
  gameTrainersSet: Set<number> = new Set();
  selectedGame: Game;
  selectedPid: number;
  savedStates: GameSavedState[] = [];
  gamePasswords: GamePasswordsInfo;
  private launchActivitySubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService, private alertService: AlertsService,
    private localizationService: LocalizationService, private platformService: PlatformService,
    private filesService: FilesService, private gamesService: GamesService) {
    const self = this;
    this.launchActivitySubscription = this.launchActivityService.getUpdatedActivities().subscribe(launchActivity => {
      self.launchActivities = launchActivity;
      if (!launchActivity.find(l => l.pid === this.selectedPid)) {
        this.savedStatesSelector.close();
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
      this.setFileGroups(activity);
      this.setSavedStates(activity);
      this.setPasswords(activity);
      this.doesTrainerExist(activity);
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
          game.name + this.getListingIfExists(game));
      }
    });
  }

  saveState(pid: number, game: Game) {
    this.launchActivityService.saveState(pid, game).then(saved => {
      if (saved) {
        this.alertService.success(this.localizationService.translate('dashboard.statesaved') + ': ' +
          game.name + this.getListingIfExists(game));
        if (!this.savedStatesMap.get(game.sha1Code)) {
          // this is a hack to force the 'Load state' to appear in the menu.
          // I couldn't just call resetStatesMap() because by the time we get here openMSX may not be
          // done saving the state file on disk
          this.savedStatesMap.set(game.sha1Code, []);
        }
      }
    });
  }

  resetStatesMap() {
    this.savedStatesMap = new Map();
    this.launchActivities.forEach(activity => {
      this.setSavedStates(activity);
    });
  }

  loadState(pid: number, game: Game) {
    this.selectedGame = game;
    this.selectedPid = pid;
    this.gamesService.getGameSavedStates(game).then((savedStates: GameSavedState[]) => {
      this.savedStatesMap.set(game.sha1Code, savedStates);
      this.savedStates = savedStates;
      this.savedStatesSelector.open();
    });
  }

  loadStateOnOpenmsx(state: string) {
    this.launchActivityService.loadState(this.selectedPid, state).then(loaded => {
      if (loaded) {
        this.alertService.success(this.localizationService.translate('dashboard.stateloaded') + ': ' +
        this.selectedGame.name + this.getListingIfExists(this.selectedGame));
      }
    });
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

  private setFileGroups(activity: any) {
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
  }

  private setSavedStates(activity: any) {
    this.gamesService.getGameSavedStates(activity.game).then((savedStates: GameSavedState[]) => {
      if (savedStates.length > 0) {
        this.savedStatesMap.set(activity.game.sha1Code, savedStates);
      }
    });
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

  private getListingIfExists(game: Game): string {
    if (game.listing) {
      return ' [' + game.listing + ']';
    } else {
      return '';
    }
  }
}
