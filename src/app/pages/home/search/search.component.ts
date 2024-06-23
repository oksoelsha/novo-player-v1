import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges,
  ViewChild, ViewChildren } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Game } from '../../../models/game';
import { GamesService } from '../../../services/games.service';

@Component({
  selector: 'app-home-game-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnChanges {

  @Input() parentMenuOpen = false;
  @Output() selectedGame: EventEmitter<Game> = new EventEmitter<Game>();
  @ViewChild('inputField') private inputField: ElementRef;
  @ViewChild('searchDropdown', { static: true }) private foundGamesDropdown: NgbDropdown;
  @ViewChildren('foundSearchItem') private foundSearchItems: QueryList<ElementRef>;

  searchText = '';
  foundGames: GameData[] = [];

  constructor(private changeDetector: ChangeDetectorRef, private gamesService: GamesService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.parentMenuOpen.currentValue === true) {
      setTimeout(() => {
        this.inputField.nativeElement.value = '';
        this.inputField.nativeElement.focus();
      }, 0);
    } else if (changes.parentMenuOpen.currentValue === false) {
      this.searchText = '';
    }
  }

  onSearchGames(event: any) {
    const trimmedText = event.target.value.trim();
    if (trimmedText) {
      this.gamesService.getSearch(trimmedText).then((games: Game[]) => {
        this.foundGames = [];
        if (games.length > 0) {
          // if the given search string contains Arabic characters, disable the highlighting because the presence
          // of such characters messes up the highlighting
          const containsArabic = (/[\u0600-\u06FF]/).test(trimmedText);
          for (const game of games) {
            let part1: string;
            let part2: string;
            let part3: string;
            if (containsArabic) {
              part1 = game.name;
            } else {
              const index = game.name.toLowerCase().indexOf(trimmedText.toLowerCase());
              if (index < 0) {
                part1 = game.name;
              } else {
                part1 = game.name.substring(0, index);
                part2 = game.name.substring(index, index + trimmedText.length);
                part3 = game.name.substring(index + trimmedText.length);
              }
            }
            const gameData = new GameData(game, new GameNameParts(part1, part2, part3));
            this.foundGames.push(gameData);
          };
          this.foundGamesDropdown.open();
        } else {
          this.foundGamesDropdown.close();
        }
        this.changeDetector.markForCheck();
      });
    } else {
      this.foundGamesDropdown.close();
      this.foundGames = [];
    }
  }

  processArrowKey(event: KeyboardEvent) {
    if (this.foundGames.length > 0 && event.key === 'ArrowDown') {
      this.foundSearchItems.toArray()[0].nativeElement.focus();
    }
  }

  onSelectGame(game: Game) {
    this.searchText = '';
    this.foundGames = [];
    this.selectedGame.emit(game);
  }
}

class GameData {
  readonly game: Game;
  readonly gameNameParts: GameNameParts;

  constructor(game: Game, gameNameParts: GameNameParts) {
    this.game = game;
    this.gameNameParts = gameNameParts;
  }
}

class GameNameParts {
  readonly part1: string;
  readonly part2: string;
  readonly part3: string;

  constructor(part1: string, part2: string, part3: string) {
    this.part1 = part1;
    this.part2 = part2;
    this.part3 = part3;
  }
}
