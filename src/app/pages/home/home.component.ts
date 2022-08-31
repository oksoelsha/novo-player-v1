import { Component, OnInit, ViewChild, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Game } from '../../models/game';
import { GameSecondaryData } from '../../models/secondary-data';
import { Settings } from '../../models/settings';
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
import { WebMSXMachinesData, WebMSXMachineUtils } from '../../models/webmsx-machines';

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

  @ViewChild('gameNameEditInput', { static: false }) private gameNameEdit: ElementRef;
  @ViewChild('scanParameters') scanParameters: ScanParametersComponent;
  @ViewChild('manageListings') manageListings: ManageListingsComponent;
  @ViewChild('mediaEdit') mediaEdit: MediaEditComponent;
  @ViewChild('hardwareEdit') hardwareEdit: HardwareEditComponent;
  @ViewChild('infoFileFieldEdit') infoFileFieldEdit: InfoFileFieldEditComponent;
  @ViewChild('bluemsxArgumentsEdit') bluemsxArgumentsEdit: BluemsxArgumentsEditComponent;
  @ViewChild('webmsxMachineSet') webmsxMachineSet: WebmsxMachineSetComponent;
  @ViewChild('relatedGames') relatedGames: RelatedGamesComponent;
  @ViewChild('changeListing') changeListing: ChangeListingComponent;
  @ViewChild('favoritesDropdownButton', { static: true }) private favoritesDropdownButton: ElementRef;
  @ViewChild('searchDropdown', { static: true }) private searchDropdown: NgbDropdown;
  @ViewChild('dragArea', { static: false }) private dragArea: ElementRef;
  @ViewChild(ContextMenuComponent) public rightClickMenu: ContextMenuComponent;

  readonly isWindows = this.platformService.isOnWindows();
  readonly webmsxMachines = WebMSXMachinesData;
  draggedFilesAndFolders: string[] = [];
  selectedListing = '';
  games: Game[] = [];
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
  listings: string[] = [];
  openMenuEventCounter = 0;
  contextMenuOpened = false;
  searchMenuOpen = false;
  musicMenuOpen = false;
  popupOpen = false;
  isOpenMSXPathDefined: boolean;
  isWebMSXPathDefined: boolean;
  isBlueMSXPathDefined: boolean;
  musicFiles: string[] = [];
  selectedMusicFile: string;
  favorites: Game[] = [];
  sortData: SortData;
  showUndo: boolean;

  private readonly noScreenshotImage1: GameSecondaryData = new GameSecondaryData('assets/images/noscrsht.png', '', null);
  private readonly noScreenshotImage2: GameSecondaryData = new GameSecondaryData('', 'assets/images/noscrsht.png', null);
  private readonly noScreenshotData: GameSecondaryData = new GameSecondaryData('', '', null);

  private toggle = false;
  private gamesTable: Element;
  private gameQuickSearch = '';
  private quickTypeTimer: NodeJS.Timer = null;
  private dragCounter = 0;
  private historyToUndoSubscription: Subscription;

  constructor(private gamesService: GamesService, private scanner: ScannerService, private alertService: AlertsService,
    private settingsService: SettingsService, private eventsService: EventsService, private router: Router,
    private contextMenuService: ContextMenuService, private localizationService: LocalizationService,
    private undoService: UndoService, private platformService: PlatformService) {

    const self = this;
    this.historyToUndoSubscription = this.undoService.getIfTransactionsToUndo().subscribe(isDataToUndo => {
      self.showUndo = isDataToUndo;
    });
    this.showUndo = this.undoService.isThereUndoHistory();
  }

  @HostListener('window:keyup', ['$event'])
  keyupEvent(event: KeyboardEvent) {
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
  keydownEvent(event: KeyboardEvent) {
    if (this.canHandleEvents()) {
      if (event.key.length === 1 && !this.ctrlOrCommandKey(event) && (
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
      } else if (this.ctrlOrCommandKey(event) && (event.key === 'f' || event.key === 'F')) {
        this.searchDropdown.open();
      } else if (this.ctrlOrCommandKey(event) && (event.key === 'z' || event.key === 'Z')) {
        this.undo();
      } else if (this.selectedGame != null) {
        if (event.key === 'Enter') {
          this.launch(this.selectedGame);
        } else if (event.key === 'Delete') {
          this.remove(event, this.selectedGame);
        }
      }
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
        this.draggedFilesAndFolders = Array.from(files).map(f => f.path);
        this.scanParameters.open();
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

    const self = this;
    this.settingsService.getSettings().then((settings: Settings) => {

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
      });

      this.isOpenMSXPathDefined = settings.openmsxPath != null && settings.openmsxPath.trim() !== '';
      this.isWebMSXPathDefined = settings.webmsxPath != null && settings.webmsxPath.trim() !== '';
      this.isBlueMSXPathDefined = settings.bluemsxPath != null && settings.bluemsxPath.trim() !== '';
      this.localizationService.useLanguage(settings.language);
    });

    this.getFavorites();
  }

  ngOnDestroy() {
    this.historyToUndoSubscription.unsubscribe();
  }

  handleOpenMenuEvents(opened: boolean) {
    opened ? this.openMenuEventCounter++ : this.openMenuEventCounter--;
  }

  setSelectedListing(listing: string) {
    if (listing !== this.selectedListing) {
      this.games = [];
      this.otherSelectedGames.clear();
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
    sessionStorage.setItem('selectedListing', listing);

    this.gamesService.getGames(this.selectedListing).then((data: Game[]) => {
      this.sortGames(data);
      this.games = data;
      this.gameToRename = null;
      for (const game of data) {
        if (sha1Code && game.sha1Code === sha1Code) {
          setTimeout(() => {
            this.showInfo(game);
          }, 0);
        }
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
    this.gamesService.launchGame(game).then((errorMessage: string) => {
      if (errorMessage) {
        this.alertService.failure(this.localizationService.translate('home.failedtostartopenmsxfor') + ': ' + game.name
          + ' [' + errorMessage + ']');
      } else {
        this.alertService.info(this.localizationService.translate('home.openmsxwindowclosedfor') + ': ' + game.name);
      }
    });
  }

  launchWebmsx(game: Game) {
    this.router.navigate(['./wmsx', { gameParams: JSON.stringify(this.selectedGame) }], { queryParams: this.getWebMSXParams() });
    this.eventsService.logEvent(new Event(EventSource.WebMSX, EventType.LAUNCH, GameUtils.getMonikor(game)));
  }

  launchBlueMSX(game: Game) {
    this.gamesService.launchGameOnBlueMSX(game).then((errorMessage: string) => {
      if (errorMessage) {
        this.alertService.failure(this.localizationService.translate('home.failedtostartbluemsxmsxfor') + ': ' + game.name
          + ' [' + errorMessage + ']');
      } else {
        this.alertService.info(this.localizationService.translate('home.bluemsxwindowclosedfor') + ': ' + game.name);
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
        this.gamesService.updateGame(newGame, gameToRestore, true).then((err: boolean) => {
          if (err) {
            this.alertService.failure(this.localizationService.translate('home.gamewasnotrestored') + ': ' + gameToRestore.name +
              ' [' + gameToRestore.listing + ']');
          } else {
            this.alertService.success(this.localizationService.translate('home.gamewasrestored') + ': ' + gameToRestore.name +
              ' [' + gameToRestore.listing + ']');
            if (gameToRestore.listing === this.selectedListing) {
              this.removeGameFromList(newGame, false);
              this.addGameToSortedList(gameToRestore);
              setTimeout(() => {
                this.showInfo(gameToRestore);
              }, 0);
              if (gameToRestore.listing !== newGame.listing) {
                // remove the other listing if it was empty - the easiest way to do it is to get all listings again
                this.gamesService.getListings().then((data: string[]) => {
                  this.listings = data;
                });
              }
            } else if (gameToRestore.listing !== this.selectedListing && newGame.listing === this.selectedListing) {
              this.removeGameFromList(newGame, true);
              this.addListingToListings(gameToRestore.listing);
            }
          }
        });
      }
    }
  }

  update(oldGame: Game, newGame: Game) {
    this.gamesService.updateGame(oldGame, newGame).then((err: boolean) => {
      if (err) {
        this.alertService.failure(this.localizationService.translate('home.gamewasnotupdated') + ': ' + oldGame.name +
          ' - ' + this.localizationService.translate('home.cannotchangegamemainfile'));
      } else {
        this.alertService.success(this.localizationService.translate('home.gamewasupdated') + ': ' + newGame.name);
        this.removeGameFromList(oldGame, false);
        this.addGameToSortedList(newGame);
        setTimeout(() => {
          this.showInfo(newGame);
        }, 0);
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
      return;
    }
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
    }
    else {
      this.showInfo(game);
    }
  }

  showInfo(game: Game) {
    this.setAsSelectedGame(game);
    this.adjustScrollForSelectedGame(game);
    this.gamesService.getSecondaryData(game).then((secondaryData) => {
      this.setScreenshots(secondaryData);
      this.setMusicFiles(secondaryData);

      // Decrement the open menu counter because there's a case where it doesn't get decremented with the closing of the menu.
      // That case is for the game music tracks menu where the closing menu event does not fire if the if-statement around the
      // html segment evaluates to false after clicking on a different game without music.
      if (this.musicFiles.length === 0 && this.musicMenuOpen) {
        this.openMenuEventCounter--;
        this.musicMenuOpen = false;
      }
    });
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
    this.scanner.scan(parameters).then(result => {
      this.alertService.info(this.localizationService.translate('home.totalgamesadded') + ' = ' + result);

      this.gamesService.getListings().then((data: string[]) => {
        this.listings = data;
        if (!this.selectedListing) {
          // this can happen after a scan that adds the first listing
          this.selectedListing = this.listings[0];
        }
        this.getGames(this.selectedListing);
      });
      this.scanRunning = false;
    });
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

  private initialize() {
    this.selectedGame = null;
    this.screenshotA1 = this.screenshotA2 = this.noScreenshotImage1;
    this.screenshotB1 = this.screenshotB2 = this.noScreenshotImage2;
  }

  private canHandleEvents(): boolean {
    return !this.isEditMode() && !(this.openMenuEventCounter > 0) && !this.popupOpen && !this.contextMenuOpened;
  }

  private ctrlOrCommandKey(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey;
  }

  private setAsSelectedGame(game: Game) {
    if (this.selectedGame) {
      const selectedGameElement = document.getElementById(this.selectedGame.sha1Code);
      // this element may not exist if, for example, another listing was switched to
      if (selectedGameElement) {
        selectedGameElement.classList.remove('selected-game');
      }
    }
    this.selectedGame = game;

    document.getElementById(game.sha1Code).classList.add('selected-game');

    this.otherSelectedGames.forEach(otherSelectedGame => {
      this.removeAsAnotherSelectedGame(otherSelectedGame);
    });
    this.otherSelectedGames.clear();

    sessionStorage.setItem('selectedGame', JSON.stringify(game));
  }

  private setAsAnotherSelectedGame(game: Game) {
    this.otherSelectedGames.add(game);
    document.getElementById(game.sha1Code).classList.add('selected-secondary-game');
  }

  private removeAsAnotherSelectedGame(game: Game) {
    this.otherSelectedGames.delete(game);
    document.getElementById(game.sha1Code).classList.remove('selected-secondary-game');
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

  private adjustScrollForSelectedGame(game: Game) {
    const gamesTableTop: number = this.gamesTable.getBoundingClientRect().top;
    const gamesTableBottom: number = this.gamesTable.getBoundingClientRect().bottom;
    const tableCellTop: number = document.getElementById(game.sha1Code).getBoundingClientRect().top;
    const tableCellBottom: number = document.getElementById(game.sha1Code).getBoundingClientRect().bottom;

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
    this.otherSelectedGames.clear();

    if (switchListingIfLastGameInCurrentListing && this.games.length === 0) {
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
    this.listings.splice(this.listings.findIndex((e) => e === this.selectedListing), 1);
    if (this.listings.length > 0) {
      this.selectedListing = this.listings[0];
      this.getGames(this.selectedListing);
    } else {
      this.games = [];
    }
  }

  private addGameToSortedList(game: Game) {
    this.games.push(game);
    this.sortGames(this.games);
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
    this.games.filter(g => g.sha1Code === sha1Code).forEach(match => this.showInfo(match));
  }

  private getWebMSXParams(): any {
    const webMSXParams: any = {};

    if (this.selectedGame.romA != null) {
      webMSXParams.ROM = this.selectedGame.romA;
    }
    if (this.selectedGame.diskA != null) {
      webMSXParams.DISK = this.selectedGame.diskA;
    }
    if (this.selectedGame.extensionRom === 'scc') {
      webMSXParams.PRESETS = 'SCC';
    } else if (this.selectedGame.extensionRom === 'scc+') {
      webMSXParams.PRESETS = 'SCCI';
    }
    if (this.selectedGame.tape != null) {
      webMSXParams.TAPE = this.selectedGame.tape;
    }

    if (this.selectedGame.webmsxMachine) {
      if (WebMSXMachineUtils.isMachineCustom(this.selectedGame.webmsxMachine)) {
        webMSXParams.CONFIG_URL = 'assets/webmsx-config/machines.json';
      }
      webMSXParams.MACHINE = WebMSXMachineUtils.getMachineNameFromValue(this.selectedGame.webmsxMachine);
    }

    return webMSXParams;
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
}
