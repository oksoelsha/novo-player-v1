import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GamePassword, GamePasswordsInfo } from '../../../models/game-passwords-info';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-password-selector',
  templateUrl: './password-selector.component.html',
  styleUrls: ['../../../common-styles.sass', './password-selector.component.sass']
})
export class PasswordSelectorComponent {

  @Input() gamePasswordsInfo: GamePasswordsInfo;
  selectedPassword: GamePassword;
  @Output() passwordToEnter: EventEmitter<GamePassword> = new EventEmitter<GamePassword>();
  @ViewChild('passwordsDropdown', { static: true }) dropdown: NgbDropdown;

  constructor() { }

  enter() {
    this.passwordToEnter.emit(this.selectedPassword);
    this.selectedPassword = null;
    this.dropdown.close();
  }
}
