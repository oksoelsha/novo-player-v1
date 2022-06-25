import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Game } from '../../models/game';
import { GamesService } from '../../services/games.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-related-games',
  templateUrl: './related-games.component.html',
  styleUrls: ['../../common-styles.sass', './related-games.component.sass']
})
export class RelatedGamesComponent  extends PopupComponent {

  @Input() popupId: string;
  @Input() game: Game;
  @ViewChild('relatedGamesDiv', { static: true }) private relatedGamesDiv: ElementRef;
  relatedGames: Game[] = [];
  imageData1: string[] = [];
  imageData2: string[] = [];

  constructor(private changeDetector: ChangeDetectorRef, private gamesService: GamesService) {
    super();
  }

  open(): void {
    this.gamesService.getRelatedGames(this.game).then((data: Game[]) => {
      this.relatedGames = data;
      for (let index = 0; index < data.length; index++) {
        this.gamesService.getSecondaryData(data[index]).then((secondaryData) => {
          this.imageData1[index] = this.getScreenshot(secondaryData.screenshot1, index);
          this.imageData2[index] = this.getScreenshot(secondaryData.screenshot2, index);
        });
      }

      super.open();
    });
  }

  close(): void {
    this.relatedGamesDiv.nativeElement.scrollTop = 0;
    this.relatedGames = [];
    this.imageData1 = [];
    this.imageData2 = [];

    super.close();
  }

  private getScreenshot(screenshotData: string, index: number): string {
    if (screenshotData) {
      return screenshotData;
    } else {
      return "assets/images/noscrsht.png";
    }
  }
}
