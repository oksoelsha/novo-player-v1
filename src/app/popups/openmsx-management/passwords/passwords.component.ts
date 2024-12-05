import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GamePassword, GamePasswordsInfo } from '../../../models/game-passwords-info';
import { LaunchActivityService } from '../../../services/launch-activity.service';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-openmsx-management-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['../openmsx-management.component.sass', './passwords.component.sass']
})
export class PasswordsComponent {

  @Input() pid: number;
  @Input() gamePasswordsInfo: GamePasswordsInfo;
  @Output() alertMessage = new EventEmitter<string>();

  constructor(private launchActivityService: LaunchActivityService, private localizationService: LocalizationService) { }

  enter(selectedPassword: GamePassword) {
    this.launchActivityService.enterPassword(this.pid, selectedPassword).then(entered => {
      if (entered) {
        this.alertMessage.emit(this.localizationService.translate('popups.openmsxmanagement.passwordentered'));
      }
    });
  }
}
