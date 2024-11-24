import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { GamePassword, GamePasswordsInfo } from '../../../models/game-passwords-info';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-password-selector',
  templateUrl: './password-selector.component.html',
  styleUrls: ['../../../common-styles.sass', './password-selector.component.sass']
})
export class PasswordSelectorComponent implements OnInit, OnDestroy {

  @Input() gamePasswordsInfo: GamePasswordsInfo;
  @Input() clearEvent: Observable<void>;
  @Output() passwordToEnter: EventEmitter<GamePassword> = new EventEmitter<GamePassword>();
  @ViewChild('passwordsDropdown', { static: true }) dropdown: NgbDropdown;
  selectedPassword: GamePassword;
  private clearEventSubscription: Subscription;

  constructor() { }
  ngOnInit(): void {
    this.selectedPassword = null;
    this.clearEventSubscription = this.clearEvent?.subscribe(() => {
      this.selectedPassword = null;
    });
  }

  ngOnDestroy(): void {
    this.clearEventSubscription?.unsubscribe();
  }

  enter() {
    this.passwordToEnter.emit(this.selectedPassword);
    this.selectedPassword = null;
    this.dropdown.close();
  }
}
