import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LaunchActivityService } from '../../../services/launch-activity.service';
import { LocalizationService } from '../../../services/localization.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-openmsx-management-text-typing',
  templateUrl: './text-typing.component.html',
  styleUrls: ['../openmsx-management.component.sass', './text-typing.component.sass']
})
export class TextTypingComponent implements OnInit, OnDestroy {

  @Input() pid: number;
  @Input() events: Observable<boolean>;
  @Output() alertMessage: EventEmitter<string> = new EventEmitter<string>();
  textToType: string;

  private eventsSubscription: Subscription;

  constructor(private launchActivityService: LaunchActivityService, private localizationService: LocalizationService) { }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((flag) => {
      if (!flag) {
        this.textToType = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
  }

  type() {
    this.launchActivityService.typeText(this.pid, this.textToType).then(typed => {
      if (typed) {
        this.alertMessage.emit(this.localizationService.translate('popups.openmsxmanagement.texttyped'));
      }
    });
  }

  clear() {
    this.textToType = null;
  }
}
