import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Game } from '../../models/game';
import { PopupComponent } from '../popup.component';
import { GamesService } from '../../services/games.service';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-more-details',
  templateUrl: './more-details.component.html',
  styleUrls: ['./more-details.component.sass']
})
export class MoreDetailsComponent  extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;

  crc32: string;
  md5: string;

  constructor(protected changeDetector: ChangeDetectorRef, private gamesService: GamesService, private clipboard: Clipboard,
    private localizationService: LocalizationService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    this.gamesService.getMoreGameHashes(this.game).then((hashes: any) => {
      this.crc32 = hashes.crc32;
      this.md5 = hashes.md5;
    });
    super.open();
  }

  close(): void {
    super.close(() => {
      this.crc32 = null;
      this.md5 = null;
    });
  }

  copy(text: string) {
    this.clipboard.copy(text);
  }
}
