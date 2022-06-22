import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Game } from '../../models/game';
import { RelatedGame } from '../../models/related-game';
import { GamesService } from '../../services/games.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-related-games',
  templateUrl: './related-games.component.html',
  styleUrls: ['../../common-styles.sass', './related-games.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatedGamesComponent  extends PopupComponent {

  @Input() popupId: string;
  @Input() game: Game;
  relatedGames: RelatedGame[] = [];

  constructor(private gamesService: GamesService) {
    super();
  }

  open(): void {
    this.gamesService.getRelatedGames(this.game).then((data: RelatedGame[]) => {
      this.relatedGames = data;

      super.open();
    });
  }

  close(): void {
    super.close();

    this.relatedGames = [];
  }
}
