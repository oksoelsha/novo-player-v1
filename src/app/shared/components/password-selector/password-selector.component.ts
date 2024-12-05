import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GamePassword, GamePasswordsInfo } from '../../../models/game-passwords-info';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-password-selector',
  templateUrl: './password-selector.component.html',
  styleUrls: ['../../../common-styles.sass', './password-selector.component.sass']
})
export class PasswordSelectorComponent {

  @Input() gamePasswordsInfo: GamePasswordsInfo;
  @Input() clearEvent: Observable<void>;
  @Output() passwordToEnter = new EventEmitter<GamePassword>();
  @ViewChild('passwordsDropdown', { static: true }) dropdown: NgbDropdown;
  selectedPassword: GamePassword = null;

  constructor() { }
  handleOpen(flag: boolean) {
    if (!flag) {
      this.selectedPassword = null;
    }
  }

  enter() {
    this.passwordToEnter.emit(this.selectedPassword);
    this.selectedPassword = null;
    this.dropdown.close();
  }
}
