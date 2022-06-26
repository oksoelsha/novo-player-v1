import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Game } from '../../models/game';
import { GameUtils } from '../../models/game-utils';
import { GamesService } from '../../services/games.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-related-games',
  templateUrl: './related-games.component.html',
  styleUrls: ['../../common-styles.sass', './related-games.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatedGamesComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @ViewChild('relatedGamesDiv', { static: true }) private relatedGamesDiv: ElementRef;
  relatedGames: Game[] = [];
  imageData1: string[] = [];
  imageData2: string[] = [];

  constructor(private gamesService: GamesService) {
    super();
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    this.gamesService.getRelatedGames(this.game).then(async (data: Game[]) => {
      this.relatedGames = data;
      for (let index = 0; index < data.length; index++) {
        const secondaryData = await this.gamesService.getSecondaryData(data[index]);
        this.imageData1[index] = this.getScreenshot(secondaryData.screenshot1);
        this.imageData2[index] = this.getScreenshot(secondaryData.screenshot2);
      }
      super.open();
    });
  }

  close(): void {
    super.close(() => {
      this.relatedGamesDiv.nativeElement.scrollTop = 0;
      this.relatedGames = [];
      this.imageData1 = [];
      this.imageData2 = [];
    });
  }

  isShowYear(relatedGame: Game) {
    return relatedGame.year !== null && String(relatedGame.year).trim() != '';
  }

  isShowGenerationMSXLink(relatedGame: Game) {
    return relatedGame.generationMSXId > 0 && relatedGame.generationMSXId < 10000;
  }

  getGenerationMSXAddress(relatedGame: Game) {
    return GameUtils.getGenerationMSXURLForGame(relatedGame.generationMSXId);
  }

  private getScreenshot(screenshotData: string): string {
    if (screenshotData) {
      return screenshotData;
    } else {
      return "assets/images/noscrsht.png";
    }
  }
}
