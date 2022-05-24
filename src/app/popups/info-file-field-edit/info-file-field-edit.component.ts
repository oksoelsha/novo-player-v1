import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from '../../models/game';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-info-file-field-edit',
  templateUrl: './info-file-field-edit.component.html',
  styleUrls: ['./info-file-field-edit.component.sass']
})
export class InfoFileFieldEditComponent  extends PopupComponent {

  @Input() popupId: string;
  @Input() game: Game;
  @Output() updatedGame: EventEmitter<Game> = new EventEmitter<Game>();

  infoFile: string;

  constructor(private localizationService: LocalizationService) {
    super();
  }

  open(): void {
    super.open();

    this.infoFile = this.game.infoFile;
  }

  close(): void {
    super.close();
  }

  save() {
    const updatedGame: Game = Object.assign({}, this.game);

    updatedGame.infoFile = this.infoFile;

    this.updatedGame.emit(updatedGame);
    this.close();
  }
}
