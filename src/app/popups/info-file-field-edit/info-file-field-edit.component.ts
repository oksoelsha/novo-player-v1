import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from '../../models/game';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-info-file-field-edit',
  templateUrl: './info-file-field-edit.component.html',
  styleUrls: ['./info-file-field-edit.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoFileFieldEditComponent  extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @Output() updatedGame: EventEmitter<Game> = new EventEmitter<Game>();

  infoFile: string;

  constructor(protected changeDetector: ChangeDetectorRef, private localizationService: LocalizationService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  open(): void {
    super.reattach();
    super.open();

    this.infoFile = this.game.infoFile;
  }

  save() {
    const updatedGame: Game = Object.assign({}, this.game);
    updatedGame.infoFile = this.infoFile;
    this.updatedGame.emit(updatedGame);

    this.close();
  }
}
