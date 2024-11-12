import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
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
  @Input() events: Observable<boolean>;
  @Input() gamePasswordsInfo: GamePasswordsInfo;
  @Output() alertMessage: EventEmitter<string> = new EventEmitter<string>();

  clearEventSubject: Subject<void> = new Subject<void>();
  private eventsSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService, private localizationService: LocalizationService) { }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (!flag) {
        this.clearEventSubject.next();
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
  }

  enter(selectedPassword: GamePassword) {
    this.launchActivityService.enterPassword(this.pid, selectedPassword).then(entered => {
      if (entered) {
        this.alertMessage.emit(this.localizationService.translate('dashboard.passwordentered'));
      }
    });
  }
}
