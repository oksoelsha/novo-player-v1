import { Component, OnInit, ViewChild, HostListener, ElementRef, OnDestroy, NgZone, QueryList, ViewChildren } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Game } from '../../models/game';
import { GameSecondaryData } from '../../models/secondary-data';
import { DisplayMode, Settings } from '../../models/settings';
import { LocalizationService } from '../../services/localization.service';
import { SettingsService } from '../../services/settings.service';
import { GamesService } from '../../services/games.service';
import { AlertsService } from '../../shared/components/alerts/alerts.service';
import { ChangeListingComponent } from '../../popups/change-listing/change-listing.component';
import { HardwareEditComponent } from '../../popups/hardware-edit/hardware-edit.component';
import { ManageListingsComponent } from '../../popups/manage-listings/manage-listings.component';
import { MediaEditComponent } from '../../popups/media-edit/media-edit.component';
import { ScanParametersComponent } from '../../popups/scan-parameters/scan-parameters.component';
import { ContextMenuComponent, ContextMenuService } from '@perfectmemory/ngx-contextmenu';
import { ChangeHistoryType, UndoService } from '../../services/undo.service';
import { EventsService } from '../../services/events.service';
import { Event, EventSource, EventType } from '../../models/event';
import { GameUtils } from '../../models/game-utils';
import { ScannerService } from '../../services/scanner.service';
import { InfoFileFieldEditComponent } from '../../popups/info-file-field-edit/info-file-field-edit.component';
import { PlatformService } from '../../services/platform.service';
import { BluemsxArgumentsEditComponent } from '../../popups/bluemsx-arguments-edit/bluemsx-arguments-edit.component';
import { Subscription } from 'rxjs';
import { RelatedGamesComponent } from '../../popups/related-games/related-games.component';
import { WebmsxMachineSetComponent } from '../../popups/webmsx-machine-set/webmsx-machine-set.component';
import { WebMSXUtils } from '../../models/webmsx-utils';
import { Filters } from '../../models/filters';
import { FiltersService } from '../../services/filters.service';
import { EmulatorService } from '../../services/emulator.service';
import { MoreScreenshotsComponent } from '../../popups/more-screenshots/more-screenshots.component';
import { GameSavedState } from '../../models/saved-state';
import { SavedStatesComponent } from '../../popups/saved-states/saved-states.component';
import { QuickLaunchComponent } from '../../popups/quick-launch/quick-launch.component';
import { ManageBackupsComponent } from '../../popups/manage-backups/manage-backups.component';
import { NewsItem } from '../../models/news-collection';
import { MsxnewsService } from '../../services/msxnews.service';
import { FiltersComponent } from './filters/filters.component';
import { MoreDetailsComponent } from '../../popups/more-details/more-details.component';
import { WindowService } from '../../services/window.service';
import { OpenmsxManagementComponent } from '../../popups/openmsx-management/openmsx-management.component';
import { LaunchActivity, LaunchActivityService } from '../../services/launch-activity.service';
import { EmuliciousArgumentsEditComponent } from '../../popups/emulicious-arguments-edit/emulicious-arguments-edit.component';
import { FilterUtils } from '../../models/filter-utils';
import { OperationCacheService } from '../../services/operation-cache.service';

export enum SortDirection {
  ASC, DESC
}

export class SortData {
  field: string;
  direction: SortDirection;

  constructor(field: string, direction: SortDirection) {
    this.field = field;
    this.direction = direction;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../common-styles.sass', './home.component.sass']
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild('scanParameters') scanParameters: ScanParametersComponent;
  @ViewChild('manageListings') manageListings: ManageListingsComponent;
  @ViewChild('mediaEdit') mediaEdit: MediaEditComponent;
  @ViewChild('hardwareEdit') hardwareEdit: HardwareEditComponent;
  @ViewChild('infoFileFieldEdit') infoFileFieldEdit: InfoFileFieldEditComponent;
  @ViewChild('bluemsxArgumentsEdit') bluemsxArgumentsEdit: BluemsxArgumentsEditComponent;
  @ViewChild('webmsxMachineSet') webmsxMachineSet: WebmsxMachineSetComponent;
  @ViewChild('emuliciousArgumentsEdit') emuliciousArgumentsEdit: EmuliciousArgumentsEditComponent;
  @ViewChild('relatedGames') relatedGames: RelatedGamesComponent;
  @ViewChild('moreScreenshots') moreScreenshots: MoreScreenshotsComponent;
  @ViewChild('changeListing') changeListing: ChangeListingComponent;
  @ViewChild('savedStatesSelector') savedStatesSelector: SavedStatesComponent;
  @ViewChild('quickLaunch') quickLaunch: QuickLaunchComponent;
  @ViewChild('manageBackups') manageBackups: ManageBackupsComponent;
  @ViewChild(ContextMenuComponent) rightClickMenu: ContextMenuComponent;
  @ViewChild('gamesTableData', { static: true }) gamesTableData: ElementRef;
  @ViewChild('gameNameEditInput', { static: false }) gameNameEdit: ElementRef;
  @ViewChild('favoritesDropdownButton', { static: true }) favoritesDropdownButton: ElementRef;
  @ViewChildren('listingsDropdown') private listingsDropdown: QueryList<NgbDropdown>;
  @ViewChild('searchDropdown', { static: true }) searchDropdown: NgbDropdown;
  @ViewChild('dragArea', { static: false }) dragArea: ElementRef;
  @ViewChild('filtersComponent') filtersComponent: FiltersComponent;
  @ViewChild('moreDetails') moreDetails: MoreDetailsComponent;
  @ViewChild('openmsxManagementInterface') openmsxManagementInterface: OpenmsxManagementComponent;

  readonly isWindows = this.platformService.isOnWindows();
  readonly ctrlCmdKey = this.platformService.isOnMac() ? 'Cmd+' : 'Ctrl+';
  draggedFilesAndFolders: string[] = [];
  selectedListing = '';
  games: Game[] = [];
  originalGames: Game[] = [];
  editedGameName: string;
  selectedGame: Game;
  otherSelectedGames: Set<Game> = new Set<Game>();
  gameToRename: Game;
  screenshotA1: GameSecondaryData;
  screenshotA2: GameSecondaryData;
  screenshotB1: GameSecondaryData;
  screenshotB2: GameSecondaryData;
  transparent1 = '';
  transparent2 = 'transparent';
  scanRunning = false;
  scanProgress: string;
  listings: string[] = [];
  openMenuEventCounter = 0;
  contextMenuOpened = false;
  searchMenuOpen = false;
  musicMenuOpen = false;
  popupOpen = false;
  isOpenMSXPathDefined: boolean;
  isWebMSXPathDefined: boolean;
  isBlueMSXPathDefined: boolean;
  isEmuliciousPathDefined: boolean;
  isGearcolecoPathDefined: boolean;
  isMSXNewsEnabled: boolean;
  musicFiles: string[] = [];
  selectedMusicFile: string;
  moreScreenshotFiles: string[] = [];
  favorites: Game[] = [];
  sortData: SortData;
  showUndo: boolean;
  filters: Filters;
  showFilters = false;
  filtersTotal = 0;
  machines: string[] = [];
  savedStates: GameSavedState[] = [];
  newsUpdated: boolean;
  news: NewsItem[] = [];
  displayMode: string;
  screenshotsPath: string;
  selectedPid = 0;
  showFileHunterGames = false;
  savedFilters: any[] = [];

  private readonly noScreenshotImage1: GameSecondaryData = new GameSecondaryData('assets/images/noscrsht.png', '', null, null);
  private readonly noScreenshotImage2: GameSecondaryData = new GameSecondaryData('', 'assets/images/noscrsht.png', null, null);

  private toggle = false;
  private gamesTable: Element;
  private gameQuickSearch = '';
  private quickTypeTimer: NodeJS.Timer = null;
  private dragCounter = 0;
  private historyToUndoSubscription: Subscription;
  private scanEndSubscription: Subscription;
  private scanProgressSubscription: Subscription;
  private newsSubscription: Subscription;
  private launchActivities: LaunchActivity[] = [];
  private launchActivitySubscription: Subscription;
  private finshedOpenMSXProcessSubscription: Subscription;
  private runningGamesBySha1Code = new Map<string, number>();

  constructor(private gamesService: GamesService, private scanner: ScannerService, private alertService: AlertsService,
    private settingsService: SettingsService, private eventsService: EventsService, private router: Router,
    private contextMenuService: ContextMenuService, private localizationService: LocalizationService,
    private undoService: UndoService, private platformService: PlatformService, private filtersService: FiltersService,
    private emulatorService: EmulatorService, private msxnewsService: MsxnewsService, private windowService: WindowService,
    private launchActivityService: LaunchActivityService, private operationCacheService: OperationCacheService,
    private ngZone: NgZone) {

    const self = this;
    this.historyToUndoSubscription = this.undoService.getIfTransactionsToUndo().subscribe(isDataToUndo => {
      self.showUndo = isDataToUndo;
    });

    this.scanEndSubscription = this.scanner.getScannerFinishedEvent().subscribe(addedGamesTotal => {
      this.ngZone.run(() => {
        self.processScanEndEvent(addedGamesTotal);
      });
    });

    this.scanProgressSubscription = this.scanner.getScannerProgressEvent().subscribe(progress => {
      this.ngZone.run(() => {
        self.processScanProgressEvents(progress);
      });
    });

    this.showUndo = this.undoService.isThereUndoHistory();

    this.newsSubscription = this.msxnewsService.getNewsNotification().subscribe(() => {
      this.ngZone.run(() => {
        self.news = self.msxnewsService.getNews();
        self.newsUpdated = self.msxnewsService.getNewNewsStatus();
      });
    });

    this.launchActivitySubscription = this.launchActivityService.getUpdatedActivities().subscribe(launchActivity => {
      self.launchActivities = launchActivity;
      if (this.selectedPid && !launchActivity.find(l => l.pid === this.selectedPid)) {
        this.selectedPid = 0;
        this.openmsxManagementInterface.close();
      }
    });
    this.launchActivities = launchActivityService.getActivities();

    this.finshedOpenMSXProcessSubscription = this.launchActivityService.getFinishOfOpenMSXProcessSubject().subscribe(game => {
      this.stopRunningIndicator(game);
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyupEvent(event: any) {
    if (this.canHandleEvents()) {
      if (this.selectedGame != null) {
        if (event.key === 'ArrowUp') {
          const index = this.games.indexOf(this.selectedGame);
          if (index > 0) {
            this.showInfo(this.games[index - 1]);
          }
        } else if (event.key === 'ArrowDown') {
          const index = this.games.indexOf(this.selectedGame);
          if (index < (this.games.length - 1)) {
            this.showInfo(this.games[index + 1]);
          }
        }
      } else if (event.key === 'ArrowDown' && this.games.length > 0) {
        this.showInfo(this.games[0]);
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  keydownEvent(event: any) {
    if (this.canHandleEvents() && !event.repeat) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.stopPropagation();
        event.preventDefault();
      } else if (event.key.length === 1 && !this.ctrlOrCommandKey(event) && (
        (event.key >= 'a' && event.key <= 'z') || (event.key >= '0' && event.key <= '9') ||
        (event.key >= 'A' && event.key <= 'Z') || event.key === ' ' || event.key === '-')) {
        if (this.quickTypeTimer != null) {
          clearTimeout(this.quickTypeTimer);
        }
        this.gameQuickSearch += event.key;
        this.quickTypeTimer = setTimeout(() => {
          this.jumpToNearestGame(this.gameQuickSearch);
          this.gameQuickSearch = '';
        }, 600);
      } else if (this.ctrlOrCommandKey(event) && event.key === '=') {
        this.windowService.zoomIn();
      } else if (this.ctrlOrCommandKey(event) && (event.key === 'f' || event.key === 'F')) {
        this.searchDropdown.open();
      } else if (this.ctrlOrCommandKey(event) && (event.key === 't' || event.key === 'T')) {
        const listingsDropdownArray = this.listingsDropdown.toArray();
        if (listingsDropdownArray.length === 1) {
          listingsDropdownArray[0].open();
        }
      } else if (this.ctrlOrCommandKey(event) && (event.key === 'q' || event.key === 'Q')) {
        this.resetAllFilters();
      } else if (this.ctrlOrCommandKey(event) && (event.key === 'z' || event.key === 'Z')) {
        this.undo();
      } else if (this.selectedGame != null) {
        if (event.key === 'Delete') {
          this.remove(event, this.selectedGame);
        } else if (this.ctrlOrCommandKey(event) && (event.key === 'e' || event.key === 'E')) {
          this.edit(this.selectedGame);
        } else if (this.otherSelectedGames.size === 0) {
          if (event.key === 'Enter') {
            this.launch(this.selectedGame);
          } else if (this.ctrlOrCommandKey(event) && event.shiftKey && (event.key === 'b' || event.key === 'B')) {
            if (this.isBlueMSXPathDefined) {
              this.launchBlueMSX(this.selectedGame);
            }
          } else if (this.ctrlOrCommandKey(event) && event.shiftKey && (event.key === 'w' || event.key === 'W')) {
            if (this.isWebMSXPathDefined) {
              this.launchWebmsx(this.selectedGame);
            }
          } else if (this.ctrlOrCommandKey(event) && event.shiftKey && (event.key === 'm' || event.key === 'M')) {
            if (this.isEmuliciousPathDefined) {
              this.launchEmulicious(this.selectedGame);
            }
          } else if (this.ctrlOrCommandKey(event) && event.shiftKey && (event.key === 'g' || event.key === 'G')) {
            if (this.isGearcolecoPathDefined) {
              this.launchGearcoleco(this.selectedGame);
            }
          } else if (this.ctrlOrCommandKey(event) && event.shiftKey && (event.key === 'h' || event.key === 'H')) {
            this.relatedGames.open();
          }
        }
      }
    } else if (event.repeat && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      // prevent scrolling of games div when up/down arrow keys are held down.
      // that happens sometimes after a game is renamed
      event.stopPropagation();
      event.preventDefault();
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    if (this.canHandleEvents()) {
      event.preventDefault();
      event.stopPropagation();
      this.dragArea.nativeElement.classList.add('drag-over');
    }
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    if (this.canHandleEvents()) {
      event.preventDefault();
      event.stopPropagation();
      this.dragCounter++;
      this.dragArea.nativeElement.classList.add('drag-over');
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    if (this.canHandleEvents()) {
      event.preventDefault();
      event.stopPropagation();
      this.dragCounter--;
      if (this.dragCounter === 0) {
        this.dragArea.nativeElement.classList.remove('drag-over');
      }
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    if (this.canHandleEvents()) {
      event.preventDefault();
      event.stopPropagation();
      this.dragCounter = 0;
      this.dragArea.nativeElement.classList.remove('drag-over');
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.draggedFilesAndFolders = Array.from(files).map(f => f.path).filter(f => f !== '');
        if (this.draggedFilesAndFolders.length > 0) {
          this.scanParameters.open();
        }
      }
    }
  }

  ngOnInit() {
    this.initialize();
    this.gamesTable = document.getElementById('games-table-data');

    if (sessionStorage.getItem('sortData') != null) {
      this.sortData = JSON.parse(sessionStorage.getItem('sortData'));
    } else {
      this.sortData = new SortData('name', SortDirection.ASC);
    }
    this.scanRunning = (sessionStorage.getItem('scanRunning') != null);

    const self = this;
    this.settingsService.getSettings().then((settings: Settings) => {
      this.setScreenshotsPath(settings);
      if (sessionStorage.getItem('displayMode') != null) {
        this.displayMode = sessionStorage.getItem('displayMode');
      } else {
        this.displayMode = settings.displayMode;
      }
      this.gamesService.getListings().then((data: string[]) => {
        this.listings = data;
        let gameSha1Code: string = null;
        if (sessionStorage.getItem('selectedListing') != null) {
          self.selectedListing = sessionStorage.getItem('selectedListing');
          if (sessionStorage.getItem('selectedGame') != null) {
            gameSha1Code = JSON.parse(sessionStorage.getItem('selectedGame')).sha1Code;
          }
        } else if (!settings.defaultListing || !settings.defaultListing.trim()) {
          if (data.length > 0) {
            self.selectedListing = data[0];
          }
        } else {
          self.selectedListing = settings.defaultListing;
        }
        self.getGames(this.selectedListing, gameSha1Code);
        self.showFileHunterGames = settings.enableFileHunterGames;
      });

      this.isOpenMSXPathDefined = settings.openmsxPath != null && settings.openmsxPath.trim() !== '';
      this.isWebMSXPathDefined = settings.webmsxPath != null && settings.webmsxPath.trim() !== '';
      this.isBlueMSXPathDefined = settings.bluemsxPath != null && settings.bluemsxPath.trim() !== '';
      this.isEmuliciousPathDefined = settings.emuliciousPath != null && settings.emuliciousPath.trim() !== '';
      this.isGearcolecoPathDefined = settings.gearcolecoPath != null && settings.gearcolecoPath.trim() !== '';
      this.isMSXNewsEnabled = settings.enableNews;
      this.localizationService.useLanguage(settings.language);

      this.emulatorService.getMachines().then((data: string[]) => {
        this.machines = data;
      });

      this.news = this.msxnewsService.getNews();
      this.newsUpdated = this.msxnewsService.getNewNewsStatus();
    });

    this.getFavorites();

    this.filters = this.filtersService.getFilters();
    this.filtersTotal = this.filters.getTotalFilters();
    this.filtersService.getSavedFilters().then(filters => {
      this.savedFilters = filters;
      this.savedFilters.sort((a: any, b: any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    });
  }

  ngOnDestroy() {
    this.historyToUndoSubscription.unsubscribe();
    this.scanProgressSubscription.unsubscribe();
    this.scanEndSubscription.unsubscribe();
    this.newsSubscription.unsubscribe();
    this.launchActivitySubscription.unsubscribe();
    this.finshedOpenMSXProcessSubscription.unsubscribe();
  }

  handleOpenMenuEvents(opened: boolean) {
    opened ? this.openMenuEventCounter++ : this.openMenuEventCounter--;
    if (!opened) {
      setTimeout(() => {
        if (!this.gamesTableData.nativeElement.contains(document.activeElement)) {
          this.gamesTableData.nativeElement.focus();
        }
      }, 0);
    }
  }

  handleOpenSearch(opened: boolean) {
    this.handleOpenMenuEvents(opened);
    this.searchMenuOpen = opened;
  }

  handleOpenNews(opened: boolean) {
    this.handleOpenMenuEvents(opened);
    this.newsUpdated = false;
    this.msxnewsService.resetNewNewsStatus();
  }

  setSelectedListing(listing: string) {
    if (listing !== this.selectedListing) {
      this.games = [];
      this.initialize();
      sessionStorage.removeItem('selectedGame');

      // wait for the clearing of the screenshots before we switch to the new listing
      setTimeout(() => {
        this.selectedListing = listing;
        this.getGames(listing);
        }, 0);
    }
  }

  getGames(listing: string, sha1Code: string = null) {
    this.selectedListing = listing;
    if (listing) {
      sessionStorage.setItem('selectedListing', listing);
    }

    this.gamesService.getGames(this.selectedListing).then((data: Game[]) => {
      this.sortGames(data);
      this.originalGames = data;
      this.games = this.filtersService.filter(data, this.filters);
      this.reshowRunningGameIndicators();

      this.gameToRename = null;
      if (sha1Code) {
        this.navigateToGame(data, sha1Code);
      }
    });
  }

  setSort(field: string) {
    if (this.sortData.field === field) {
      if (this.sortData.direction === SortDirection.ASC) {
        this.sortData.direction = SortDirection.DESC;
      } else {
        this.sortData.direction = SortDirection.ASC;
      }
    } else {
      this.sortData.field = field;
      this.sortData.direction = SortDirection.ASC;
    }
    sessionStorage.setItem('sortData', JSON.stringify(this.sortData));
    this.sortGames(this.games);
  }

  launch(game: Game) {
    this.gamesService.getGameSavedStates(game).then((savedStates: GameSavedState[]) => {
      this.savedStates = savedStates;
      if (savedStates.length === 0) {
        this.launchOpenmsx(game);
      } else {
        this.savedStatesSelector.open();
      }
    });
  }

  launchOpenmsx(game: Game) {
    this.launchGameOrStateOnOpenmsx(game);
  }

  launchOpenmsxWithState(state: string) {
    this.launchGameOrStateOnOpenmsx(this.selectedGame, state);
  }

  launchWebmsx(game: Game) {
    this.router.navigate(
      ['./wmsx', { gameParams: JSON.stringify(this.selectedGame) }],
      { queryParams: WebMSXUtils.getWebMSXParams(this.selectedGame) }
    );
    this.eventsService.logEvent(new Event(EventSource.WebMSX, EventType.LAUNCH, GameUtils.getMonikor(game)));
  }

  launchBlueMSX(game: Game) {
    this.gamesService.launchGameOnBlueMSX(game).then((errorMessage: string) => {
      if (errorMessage) {
        this.alertService.failure(this.localizationService.translate('home.failedtostartbluemsxfor') + ': ' + game.name
          + ' [' + errorMessage + ']');
      } else {
        this.alertService.info(this.localizationService.translate('home.bluemsxwindowclosedfor') + ': ' + game.name);
      }
    });
  }

  launchEmulicious(game: Game) {
    this.gamesService.launchGameOnEmulicious(game).then((errorMessage: string) => {
      if (errorMessage) {
        this.alertService.failure(this.localizationService.translate('home.failedtostartemuliciousfor') + ': ' + game.name
          + ' [' + errorMessage + ']');
      } else {
        this.alertService.info(this.localizationService.translate('home.emuliciouswindowclosedfor') + ': ' + game.name);
      }
    });
  }

  launchGearcoleco(game: Game) {
    this.gamesService.launchGameOnGearcoleco(game).then((errorMessage: string) => {
      if (errorMessage) {
        this.alertService.failure(this.localizationService.translate('home.failedtostartgearcolecofor') + ': ' + game.name
          + ' [' + errorMessage + ']');
      } else {
        this.alertService.info(this.localizationService.translate('home.gearcolecowindowclosedfor') + ': ' + game.name);
      }
    });
  }

  processKeyEventsOnTable(event: any) {
    if (!this.isEditMode()) {
      event.preventDefault();
    }
  }

  edit(game: Game) {
    this.gameToRename = this.selectedGame;
    this.editedGameName = game.name;
    setTimeout(() => {
      this.gameNameEdit.nativeElement.focus();
      this.gameNameEdit.nativeElement.select();
    }, 0);
  }

  processNewGameName(event: any) {
    if (this.editedGameName && !this.editedGameName.startsWith(' ')) {
      const renamedGame: Game = Object.assign({}, this.selectedGame);
      renamedGame.name = this.editedGameName.trim();
      this.update(this.selectedGame, renamedGame);
      event.stopPropagation();
      this.cancelEditMode();
    }
  }

  cancelEditMode() {
    this.gameToRename = null;
    this.editedGameName = '';
  }

  remove(event: any, game: Game, fromActionsMenu: boolean = false) {
    if (event) {
      event.stopPropagation();
    }
    const gamesToRemove = this.getAllSelectedGames(game);

    this.gamesService.removeGames(gamesToRemove).then((removed: boolean) => {
      if (removed) {
        if (this.otherSelectedGames.size === 0) {
          this.alertService.success(this.localizationService.translate('home.gamewasremoved') + ': ' + game.name);
        } else {
          this.alertService.success(this.localizationService.translate('home.gameswereremoved'));
        }
        if (fromActionsMenu) {
          // remove() request may come from the actions menu which will be removed from the DOM after calling
          // initialize(). Therefore, we need to decrement the open menus count here
          if (this.openMenuEventCounter > 0) {
            this.openMenuEventCounter--;
          }
        }
        this.initialize();
        this.removeGamesFromList(gamesToRemove);
      } else {
        if (this.otherSelectedGames.size === 0) {
          this.alertService.failure(this.localizationService.translate('home.gamewasnotremoved') + ': ' + game.name);
        } else {
          this.alertService.failure(this.localizationService.translate('home.gameswerenotremoved'));
        }
      }
    });
  }

  undo() {
    const changeHistory = this.undoService.getGameToRestore();
    if (changeHistory) {
      if (changeHistory.type === ChangeHistoryType.DELETE) {
        const gameToRestore = changeHistory.oldGame;
        this.gamesService.saveGame(gameToRestore).then((added: boolean) => {
          if (added) {
            this.alertService.success(this.localizationService.translate('home.gamewasrestored') + ': ' + gameToRestore.name +
              ' [' + gameToRestore.listing + ']');
            if (gameToRestore.listing === this.selectedListing) {
              this.addGameToSortedList(gameToRestore);
            }
            this.addListingToListings(gameToRestore.listing);
          } else {
            this.alertService.failure(this.localizationService.translate('home.gamewasnotrestored') + ': ' + gameToRestore.name +
              ' [' + gameToRestore.listing + ']');
          }
        });
      } else {
        const gameToRestore = changeHistory.oldGame;
        const newGame = changeHistory.newGame;
        this.gamesService.updateGame(newGame, gameToRestore, true).then((updatedGame: Game) => {
          if (!updatedGame) {
            this.alertService.failure(this.localizationService.translate('home.gamewasnotrestored') + ': ' + updatedGame.name +
              ' [' + updatedGame.listing + ']');
          } else {
            this.alertService.success(this.localizationService.translate('home.gamewasrestored') + ': ' + updatedGame.name +
              ' [' + updatedGame.listing + ']');
            if (newGame.listing === this.selectedListing) {
              this.removeGameFromList(newGame, false);
            }
            if (updatedGame.listing === this.selectedListing) {
              this.addGameToSortedList(updatedGame, true);
            }
            // to simplify logic, simply get all listings to account for removed or added ones
            this.gamesService.getListings().then((data: string[]) => {
              this.listings = data;
            });
          }
        });
      }
      this.removeAllOtherSelectedGames();
    }
  }

  update(oldGame: Game, newGame: Game) {
    this.gamesService.updateGame(oldGame, newGame).then((updatedGame: Game) => {
      if (!updatedGame) {
        this.alertService.failure(this.localizationService.translate('home.gamewasnotupdated') + ': ' + oldGame.name +
          ' - ' + this.localizationService.translate('home.failedtoupdategame'));
      } else {
        this.alertService.success(this.localizationService.translate('home.gamewasupdated') + ': ' + updatedGame.name);
        this.removeGameFromList(oldGame, false);
        this.addGameToSortedList(updatedGame, true);
      }
    });
  }

  updateHardware(hardwareData: any) {
    const gamesToUpdate = this.getAllSelectedGames(this.selectedGame);
    this.gamesService.updateHardware(gamesToUpdate, hardwareData.machine, hardwareData.fddMode, hardwareData.inputDevice,
      hardwareData.connectGFX9000).then(() => {
      if (this.otherSelectedGames.size === 0) {
        this.alertService.success(this.localizationService.translate('home.gamewasupdated') + ': ' + this.selectedGame.name);
      } else {
        this.alertService.success(this.localizationService.translate('home.gameswereupdated'));
      }
      if (this.filtersTotal > 0) {
        this.games = this.filtersService.filter(this.originalGames, this.filters);
        if (this.games.indexOf(this.selectedGame) < 0) {
          // this means selected game was filtered out of new list after hardware update
          this.selectedGame = null;
          this.removeAllOtherSelectedGames();
        }
      }
    });
  }

  setBluemsxArguments(bluemsxData: any) {
    const gamesToUpdate = this.getAllSelectedGames(this.selectedGame);
    this.gamesService.setBluemsxArguments(gamesToUpdate, bluemsxData.bluemsxArguments, bluemsxData.bluemsxOverrideSettings).then(() => {
      if (this.otherSelectedGames.size === 0) {
        this.alertService.success(this.localizationService.translate('home.gamewasupdated') + ': ' + this.selectedGame.name);
      } else {
        this.alertService.success(this.localizationService.translate('home.gameswereupdated'));
      }
    });
  }

  setEmuliciousArguments(emuliciousData: any) {
    const gamesToUpdate = this.getAllSelectedGames(this.selectedGame);
    this.gamesService.setEmuliciousArguments(gamesToUpdate, emuliciousData.emuliciousArguments,
      emuliciousData.emuliciousOverrideSettings).then(() => {
      if (this.otherSelectedGames.size === 0) {
        this.alertService.success(this.localizationService.translate('home.gamewasupdated') + ': ' + this.selectedGame.name);
      } else {
        this.alertService.success(this.localizationService.translate('home.gameswereupdated'));
      }
    });
  }

  move(game: Game, newListing: string) {
    const gamesToMove = this.getAllSelectedGames(game);
    this.gamesService.moveGames(gamesToMove, newListing).then(() => {
      if (this.otherSelectedGames.size === 0) {
        this.alertService.success(this.localizationService.translate('home.gamewasmoved') + ': ' + game.name);
      } else {
        this.alertService.success(this.localizationService.translate('home.gamesweremoved'));
      }
      if (game === this.selectedGame) {
        // move() request may come from the actions menu which will be removed from the DOM after calling
        // initialize(). Therefore, we need to decrement the open menus count here
        if (this.openMenuEventCounter > 0) {
          this.openMenuEventCounter--;
        }
        this.initialize();
      }
      this.removeGamesFromList(gamesToMove);
      this.addListingToListings(newListing);
    });
  }

  setFavoritesFlag(flag: boolean) {
    this.gamesService.setFavoritesFlag(this.selectedGame, flag).then((error: boolean) => {
      if (error) {
        this.alertService.failure(this.localizationService.translate('home.failedtogglefavoritesfor') + ': ' + this.selectedGame.name);
      } else {
        this.selectedGame.favorite = flag;
        this.getFavorites();
      }
    });
  }

  getFavorites() {
    this.gamesService.getFavorites().then((data: Game[]) => {
      this.favorites = data;
      this.favoritesDropdownButton.nativeElement.disabled = (data.length === 0);
    });
  }

  updateListings(data: any) {
    if (data.mode === ManageListingsComponent.mode.delete) {
      if (this.selectedListing === data.oldListingName) {
        this.switchListingIfCurrentIsEmpty();
        this.initialize();
      }
    } else if (data.mode === ManageListingsComponent.mode.rename) {
      if (this.selectedListing === data.oldListingName) {
        this.setSelectedListing(data.newListingName);
      }
    } else if (data.mode === ManageListingsComponent.mode.merge) {
      if (this.selectedListing === data.oldListingName) {
        this.setSelectedListing(data.newListingName);
      } else if (this.selectedListing === data.newListingName) {
        this.getGames(this.selectedListing);
      }
    }
  }

  processClickOnGame(event: any, game: Game) {
    if (game === this.selectedGame) {
      this.removeAllOtherSelectedGames();
      this.showInfo(game);
    } else {
      if (this.ctrlOrCommandKey(event)) {
        if (!this.selectedGame) {
          this.showInfo(game);
        } else {
          this.otherSelectedGames = new Set<Game>(this.otherSelectedGames);
          if (this.otherSelectedGames.has(game)) {
            this.removeAsAnotherSelectedGame(game);
          } else {
            this.setAsAnotherSelectedGame(game);
          }
        }
      } else if (event.shiftKey) {
        if (!this.selectedGame) {
          this.showInfo(game);
        } else {
          // reset other selected games first
          this.otherSelectedGames.forEach(selectedGame => {
            this.removeAsAnotherSelectedGame(selectedGame);
          });
          this.otherSelectedGames = new Set<Game>();
          const gameIndex = this.games.findIndex((e) => e.sha1Code === this.selectedGame.sha1Code);
          const shiftIndex = this.games.findIndex((e) => e.sha1Code === game.sha1Code);
          let startIndex: number;
          let endIndex: number;
          if (gameIndex > shiftIndex) {
            startIndex = shiftIndex;
            endIndex = gameIndex - 1;
          } else {
            startIndex = gameIndex + 1;
            endIndex = shiftIndex;
          }
          for(let index = startIndex; index <= endIndex; index++) {
            this.setAsAnotherSelectedGame(this.games[index]);
          }
        }
      } else {
        this.showInfo(game);
      }
    }
  }

  showInfo(game: Game) {
    if (this.setAsSelectedGame(game)) {
      this.adjustScrollForSelectedGame(game);
      this.gamesService.getSecondaryData(game).then((secondaryData) => {
        this.setScreenshots(secondaryData);
        this.setMusicFiles(secondaryData);
        this.setMoreScreenshots(secondaryData);

        // Decrement the open menu counter because there's a case where it doesn't get decremented with the closing of the menu.
        // That case is for the game music tracks menu where the closing menu event does not fire if the if-statement around the
        // html segment evaluates to false after clicking on a different game without music.
        if (this.musicFiles.length === 0 && this.musicMenuOpen) {
          this.openMenuEventCounter--;
          this.musicMenuOpen = false;
        }
      });
    } else {
      this.initialize();
      this.alertService.info(this.localizationService.translate('home.cannotdisplayduetofilters'));
    }
  }

  showFoundGame(game: Game) {
    if (game.listing === this.selectedListing) {
      this.showInfoBySha1Code(game.sha1Code);
    } else {
      this.getGames(game.listing, game.sha1Code);
    }

    // this is needed for when the Enter key is pressed to select a game from the search menu
    this.searchDropdown.close();
  }

  onContextMenu($event: MouseEvent, game: Game): void {
    this.contextMenuOpened = true;
    if (game !== this.selectedGame && !this.otherSelectedGames.has(game)) {
      this.showInfo(game);
    }
    this.contextMenuService.show.next({
      contextMenu: this.rightClickMenu,
      event: $event,
      item: game,
    });
    $event.preventDefault();
    $event.stopPropagation();
  }

  isMenuItemVisible = (game: Game): boolean => {
    return !(this.otherSelectedGames.has(game) || (game === this.selectedGame && this.otherSelectedGames.size > 0));
  };

  isMenuItemAddFavorite = (game: Game): boolean => {
    return !game?.favorite &&
      !(this.otherSelectedGames.has(game) || (game === this.selectedGame && this.otherSelectedGames.size > 0));
  };

  isMenuItemRemoveFavorite = (game: Game): boolean => {
    return game?.favorite &&
      !(this.otherSelectedGames.has(game) || (game === this.selectedGame && this.otherSelectedGames.size > 0));
  };

  startScan(parameters: any/*ScanParameters*/) {
    this.alertService.info(this.localizationService.translate('home.startedscanprocess'));
    this.scanRunning = true;
    sessionStorage.setItem('scanRunning', 't');
    this.scanner.scan(parameters);
  }

  setSelectedMusicFile(musicFile: string) {
    this.selectedMusicFile = musicFile;
  }

  getMusicName(musicFile: string) {
    const firstIndex = musicFile.lastIndexOf('/') + 1;
    const lastIndex = musicFile.lastIndexOf('.');
    if (lastIndex < firstIndex) {
      return this.localizationService.translate('home.unknown');
    }
    const filename = musicFile.substring(firstIndex, lastIndex);
    const separaterIndex = filename.indexOf('_');
    if (separaterIndex < 0) {
      return filename;
    } else {
      return filename.substring(separaterIndex + 1);
    }
  }

  setWebmsxMachine(machine: number) {
    const gamesToUpdate = this.getAllSelectedGames(this.selectedGame);
    this.gamesService.setWebmsxMachine(gamesToUpdate, machine).then(() => {
      if (this.otherSelectedGames.size === 0) {
        this.alertService.success(this.localizationService.translate('home.gamewasupdated') + ': ' + this.selectedGame.name);
      } else {
        this.alertService.success(this.localizationService.translate('home.gameswereupdated'));
      }
    });
  }

  toggleFiltersForm() {
    // delay the flipping of the showFilters flag to avoid switching between the Show/Hide menu items while
    // menu is still open for a split second
    setTimeout(() => {
      this.showFilters = !this.showFilters;
    }, 100);
  }

  applyFilters(filters: Filters) {
    this.removeAllOtherSelectedGames();
    this.otherSelectedGames.clear();
    this.filters = filters;
    this.filtersTotal = this.filters.getTotalFilters();
    this.games = this.filtersService.filter(this.originalGames, this.filters);
    if (this.games.indexOf(this.selectedGame) < 0) {
      // this can happen if the selected game was filtered out
      this.initialize();
      sessionStorage.removeItem('selectedGame');
    }
    this.reshowRunningGameIndicators();
  }

  loadFilters(filters: any) {
    if (this.showFilters) {
      // apply filters on the filters component to update its buttons
      this.filtersComponent.loadFilters(filters);
    } else {
      const savedFilters = FilterUtils.convertToFilters(filters.filters, this.operationCacheService);
      this.applyFilters(savedFilters);
    }
  }

  resetAllFilters() {
    if (this.filtersComponent) {
      this.filtersComponent.resetFilters();
    } else {
      this.resetFiltersData();
    }
  }

  resetFiltersData() {
    this.filtersTotal = 0;
    this.filters.reset();
    this.games = this.filtersService.filter(this.originalGames, this.filters);
  }

  reloadAfterRestore() {
    this.gamesService.getListings().then((data: string[]) => {
      this.listings = data;
      this.getGames(this.selectedListing);
    });
  }

  switchDisplayMode() {
    if (this.displayMode === DisplayMode[0]) {
      this.displayMode = DisplayMode[1];
    } else {
      this.displayMode = DisplayMode[0];
    }
    sessionStorage.setItem('displayMode', this.displayMode);
    this.reshowRunningGameIndicators();
    if (this.selectedGame) {
      setTimeout(() => {
        this.showInfo(this.selectedGame);
      }, 0);
    }
  }

  openOpenmsxSessionManagement(game: Game) {
    const launchActivities = this.launchActivities.filter(activity => activity.game.sha1Code === game.sha1Code
      && activity.source === EventSource.openMSX);
    if (launchActivities.length > 1) {
      this.alertService.info(this.localizationService.translate('home.cannotstartopenmsxsessionmanagement'));
    } else {
      this.selectedPid = launchActivities[0].pid;
      this.openmsxManagementInterface.open();
    }
  }

  /*
  * Only called from the openMSX management popup if a screenshot is taken
  */
  updateMoreScreenshots() {
    if (this.moreScreenshotFiles.length === 0) {
      this.gamesService.getSecondaryData(this.selectedGame).then((secondaryData) => {
        this.setMoreScreenshots(secondaryData);
      });
    }
  }

  private setScreenshotsPath(settings: Settings) {
    if (settings.screenshotsPath.indexOf('\\') > -1 ) {
      // this is for Windows
      this.screenshotsPath = settings.screenshotsPath.replace(/\\/g, '/').substring(2);
    } else {
      this.screenshotsPath = settings.screenshotsPath;
    }
    if (!this.screenshotsPath.endsWith('/')) {
      this.screenshotsPath = this.screenshotsPath + '/';
    }
  }

  private initialize() {
    this.selectedGame = null;
    this.screenshotA1 = this.screenshotA2 = this.noScreenshotImage1;
    this.screenshotB1 = this.screenshotB2 = this.noScreenshotImage2;
    this.otherSelectedGames.clear();
    this.musicFiles = [];
    this.moreScreenshotFiles = [];
  }

  private canHandleEvents(): boolean {
    return !this.isEditMode() && !(this.openMenuEventCounter > 0) && !this.popupOpen && !this.contextMenuOpened;
  }

  private ctrlOrCommandKey(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey;
  }

  private setAsSelectedGame(game: Game): boolean {
    if (this.selectedGame) {
      const selectedGameElement = document.getElementById(this.selectedGame.sha1Code);
      // this element may not exist if, for example, another listing was switched to
      if (selectedGameElement) {
        selectedGameElement.classList.remove('selected-game');
        sessionStorage.removeItem('selectedGame');
      }
    }

    this.otherSelectedGames.forEach(otherSelectedGame => {
      this.removeAsAnotherSelectedGame(otherSelectedGame);
    });

    const gameElement = document.getElementById(game?.sha1Code);
    if (gameElement) {
      this.selectedGame = game;
      gameElement.classList.add('selected-game');
      sessionStorage.setItem('selectedGame', JSON.stringify(game));
      return true;
    } else {
      return false;
    }
  }

  private setAsAnotherSelectedGame(game: Game) {
    this.otherSelectedGames.add(game);
    document.getElementById(game.sha1Code).classList.add('selected-secondary-game');
    this.musicFiles = [];
    this.moreScreenshotFiles = [];
  }

  private removeAsAnotherSelectedGame(game: Game) {
    this.otherSelectedGames.delete(game);
    document.getElementById(game.sha1Code)?.classList.remove('selected-secondary-game');
  }

  private removeAllOtherSelectedGames() {
    this.otherSelectedGames.forEach(game => {
      this.removeAsAnotherSelectedGame(game);
    });
  }

  private setScreenshots(secondaryData: GameSecondaryData) {
    if (this.toggle) {
      this.screenshotA1 = this.getScreenshot1Data(secondaryData);
      this.screenshotB1 = this.getScreenshot2Data(secondaryData);
      this.transparent1 = '';
      this.transparent2 = 'transparent';
    } else {
      this.screenshotA2 = this.getScreenshot1Data(secondaryData);
      this.screenshotB2 = this.getScreenshot2Data(secondaryData);
      this.transparent1 = 'transparent';
      this.transparent2 = '';
    }
    this.toggle = !this.toggle;
  }

  private setMusicFiles(secondaryData: GameSecondaryData) {
    this.musicFiles = secondaryData.musicFiles;
    if (this.musicFiles.length > 0) {
      this.selectedMusicFile = this.musicFiles[0];
    } else {
      this.selectedMusicFile = null;
    }
  }

  private setMoreScreenshots(secondaryData: GameSecondaryData) {
    this.moreScreenshotFiles = secondaryData.moreScreenshots;
  }

  private navigateToGame(games: Game[], sha1Code: string) {
    const game = games.find(g => g.sha1Code === sha1Code);
    if (game) {
      setTimeout(() => {
        this.showInfo(game);
      }, 0);
    }
  }

  private launchGameOrStateOnOpenmsx(game: Game, state: string = null) {
    this.startRunningIndicator(game);
    this.gamesService.launchGameOnOpenMSX(game, state).then((errorMessage: string) => {
      if (errorMessage) {
        this.alertService.failure(this.localizationService.translate('home.failedtostartopenmsxfor') + ': ' + game.name
          + ' [' + errorMessage + ']');
      } else {
        this.alertService.info(this.localizationService.translate('home.openmsxwindowclosedfor') + ': ' + game.name);
      }
      // use Subject/Observable subscription to infrorm that the process has finished to stop the running indicator rather
      // than calling the stop indicator function directly. Reason is that calling the stop indicator function directly
      // will access an older copy of the runningGamesBySha1Code map after leaving the home page and coming back to it
      this.launchActivityService.handleFinishOfOpenMSXProcess(game);
    });
  }

  private startRunningIndicator(game: Game) {
    const sameSha1RunningTotal = this.runningGamesBySha1Code.get(game.sha1Code);
    if (sameSha1RunningTotal) {
      // already running - increment only
      this.runningGamesBySha1Code.set(game.sha1Code, sameSha1RunningTotal + 1);
    } else {
      this.runningGamesBySha1Code.set(game.sha1Code, 1);
      document.getElementById(game.sha1Code + '-running').style.display = 'inline';
      const allAnimations = document.getAnimations();
      if (allAnimations.length > 1) {
        // restart all of them to keep them in sync
        allAnimations.forEach((blinker) => {
          if ((blinker as CSSAnimation).animationName === 'blinker') {
            blinker.cancel();
            blinker.play();
          }
        });
      }
    }
  }

  private stopRunningIndicator(game: Game) {
    const sameSha1RunningTotal = this.runningGamesBySha1Code.get(game.sha1Code);
    if (sameSha1RunningTotal === 1) {
      this.runningGamesBySha1Code.delete(game.sha1Code);
      const indicator = document.getElementById(game.sha1Code + '-running');
      if (indicator) {
        // this may happen if openMSX is closed while not in the home page
        indicator.style.display = 'none';
      }
    } else {
      this.runningGamesBySha1Code.set(game.sha1Code, sameSha1RunningTotal - 1);
    }
  }

  private adjustScrollForSelectedGame(game: Game) {
    const gamesTableTop = this.gamesTable.getBoundingClientRect().top;
    const gamesTableBottom = this.gamesTable.getBoundingClientRect().bottom;
    const tableCellTop = document.getElementById(game.sha1Code).getBoundingClientRect().top;
    const tableCellBottom = document.getElementById(game.sha1Code).getBoundingClientRect().bottom;

    if (tableCellTop < gamesTableTop) {
      this.gamesTable.scrollTop = (tableCellTop + this.gamesTable.scrollTop) - gamesTableTop;
    } else if (tableCellBottom > gamesTableBottom) {
      this.gamesTable.scrollTop = (tableCellBottom + this.gamesTable.scrollTop) - gamesTableBottom;
    }
  }

  private getScreenshot1Data(screenshots: GameSecondaryData): GameSecondaryData {
    if (!screenshots.screenshot1) {
      return this.noScreenshotImage1;
    } else {
      return screenshots;
    }
  }

  private getScreenshot2Data(screenshots: GameSecondaryData): GameSecondaryData {
    if (!screenshots.screenshot2) {
      return this.noScreenshotImage2;
    } else {
      return screenshots;
    }
  }

  private removeGamesFromList(games: Game[]) {
    games.forEach(game => {
      this.removeGameFromList(game);
    });
  }

  private removeGameFromList(game: Game, switchListingIfLastGameInCurrentListing: boolean = true) {
    this.games.splice(this.games.findIndex((e) => e.sha1Code === game.sha1Code), 1);
    this.originalGames.splice(this.originalGames.findIndex((e) => e.sha1Code === game.sha1Code), 1);
    this.otherSelectedGames.clear();

    if (switchListingIfLastGameInCurrentListing && this.originalGames.length === 0) {
      this.switchListingIfCurrentIsEmpty();
    }
  }

  private getAllSelectedGames(game: Game) {
    const allSelectedGames: Game[] = [];
    if (game === this.selectedGame || this.otherSelectedGames.has(game)) {
      // this means that this game is one of the selected games
      allSelectedGames.push(this.selectedGame);
      this.otherSelectedGames.forEach(otherGame => {
        allSelectedGames.push(otherGame);
      });
    } else {
      allSelectedGames.push(game);
    }
    return allSelectedGames;
  }

  private switchListingIfCurrentIsEmpty() {
    const index = this.listings.findIndex((e) => e === this.selectedListing);
    if (index >= 0) {
      // the currently selected listing may have been removed already. That's why we check
      this.listings.splice(index, 1);
    }
    if (this.listings.length > 0) {
      this.selectedListing = this.listings[0];
      this.getGames(this.selectedListing);
    } else {
      this.games = [];
    }
  }

  private addGameToSortedList(game: Game, navigateToGame: boolean = false) {
    if (this.filtersTotal > 0) {
      this.getGames(this.selectedListing, navigateToGame ? game.sha1Code : null);
    } else {
      this.games.push(game);
      this.sortGames(this.games);
      this.originalGames.push(game);
      this.navigateToGame(this.games, game.sha1Code);
    }
  }

  private addListingToListings(listing: string) {
    if (this.listings.findIndex((e) => e === listing) < 0) {
      let index: number;
      for (index = 0; index < this.listings.length &&
        this.listings[index].toLowerCase().localeCompare(listing.toLowerCase()) < 0; index++) { }
      this.listings.splice(index, 0, listing);
    }
  }

  private jumpToNearestGame(charachters: string) {
    let index: number;
    for (index = 0; index < this.games.length && !this.games[index].name.toLowerCase().startsWith(charachters.toLowerCase()); index++) { }
    if (index < this.games.length) {
      this.showInfo(this.games[index]);
    }
  }

  private isEditMode(): boolean {
    return this.selectedGame && this.selectedGame === this.gameToRename;
  }

  private showInfoBySha1Code(sha1Code: string) {
    const match = this.games.filter(g => g.sha1Code === sha1Code);
    this.showInfo(match[0]);
  }

  private sortGames(games: Game[]) {
    games.sort((a: Game, b: Game) => {
      if (!a[this.sortData.field]) {
        return 1;
      } else if (!b[this.sortData.field]) {
        return -1;
      } else if (a[this.sortData.field].toString().toLowerCase() < b[this.sortData.field].toString().toLowerCase()) {
        return this.sortData.direction === SortDirection.ASC ? -1 : 1;
      } else if (a[this.sortData.field].toString().toLowerCase() > b[this.sortData.field].toString().toLowerCase()) {
        return this.sortData.direction === SortDirection.ASC ? 1 : -1;
      } else {
        return 0;
      }
    });
    this.games = this.games.slice();
  }

  private processScanEndEvent(addedGamesTotal: number) {
    this.alertService.info(this.localizationService.translate('home.totalgamesadded') + ' = ' + addedGamesTotal);

    this.gamesService.getListings().then((data: string[]) => {
      this.listings = data;
      if (!this.selectedListing) {
        // this can happen after a scan that adds the first listing
        this.selectedListing = this.listings[0];
      }
      this.getGames(this.selectedListing);
    });
    this.scanRunning = false;
    this.scanProgress = null;
  }

  private processScanProgressEvents(progress: string) {
    if (this.scanProgress !== progress) {
      this.scanProgress = progress;
    }
  }

  private reshowRunningGameIndicators() {
    this.runningGamesBySha1Code.clear();
    const runningGames = new Set<string>();
    this.launchActivities.forEach(activity => {
      if (activity.source === EventSource.openMSX) {
        runningGames.add(activity.game.sha1Code);
      }
    });
    setTimeout(() => {
      this.games.forEach(game => {
        if (runningGames.has(game.sha1Code)) {
          this.startRunningIndicator(game);
        }
      });
    }, 0);
  }
}
