import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GamePassword, GamePasswordsInfo } from '../../../models/game-passwords-info';
import { LaunchActivityService } from '../../../services/launch-activity.service';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-openmsx-management-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['../../../common-styles.sass', '../openmsx-management.component.sass', './passwords.component.sass']
})
export class PasswordsComponent implements OnInit, OnDestroy {

  @Input() pid: number;
  @Input() events: Observable<boolean>;
  @Input() gamePasswordsInfo: GamePasswordsInfo;
  @Output() alertMessage: EventEmitter<string> = new EventEmitter<string>();
  selectedPassword: GamePassword;

  private eventsSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService, private localizationService: LocalizationService) { }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (!flag) {
        this.selectedPassword = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
  }

  enter() {
    if (this.selectedPassword) {
      this.launchActivityService.enterPassword(this.pid, this.selectedPassword).then(entered => {
        if (entered) {
          this.alertMessage.emit(this.localizationService.translate('dashboard.passwordentered'));
        }
      });
    }
  }
}
