import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from '../../models/game';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-bluemsx-arguments-edit',
  templateUrl: './bluemsx-arguments-edit.component.html',
  styleUrls: ['./bluemsx-arguments-edit.component.sass']
})
export class BluemsxArgumentsEditComponent extends PopupComponent {

  @Input() popupId: string;
  @Input() game: Game;
  @Output() bluemsxData: EventEmitter<any> = new EventEmitter<any>();

  bluemsxArguments: string;
  bluemsxOverrideSettings: boolean;

  constructor(private localizationService: LocalizationService) {
    super();
  }

  open(): void {
    super.open();

    this.bluemsxArguments = this.game.bluemsxArguments;
    this.bluemsxOverrideSettings = this.game.bluemsxOverrideSettings;
  }

  close(): void {
    super.close();
  }

  save() {
    const updatedGame: Game = Object.assign({}, this.game);

    updatedGame.bluemsxArguments = this.bluemsxArguments;
    updatedGame.bluemsxOverrideSettings = this.bluemsxOverrideSettings;

    this.bluemsxData.emit({'bluemsxArguments': this.bluemsxArguments, 'bluemsxOverrideSettings': this.bluemsxOverrideSettings});
    this.close();
  }
}
