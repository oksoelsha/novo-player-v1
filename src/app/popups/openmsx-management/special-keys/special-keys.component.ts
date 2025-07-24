import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LaunchActivityService } from '../../../services/launch-activity.service';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-openmsx-management-special-keys',
  templateUrl: './special-keys.component.html',
  styleUrls: ['../openmsx-management.component.sass', './special-keys.component.sass']
})
export class SpecialKeysComponent {

  @Input() pid: number;
  @Output() alertMessage: EventEmitter<string> = new EventEmitter<string>();

  constructor(private launchActivityService: LaunchActivityService, private localizationService: LocalizationService) { }

  pressControlStop() {
    this.launchActivityService.pressControlStop(this.pid).then(pressed => {
      if (pressed) {
        this.alertMessage.emit(this.localizationService.translate('popups.openmsxmanagement.specialkeyspressed'));
      }
    });
  }

  pressStop() {
    this.launchActivityService.pressStop(this.pid).then(pressed => {
      if (pressed) {
        this.alertMessage.emit(this.localizationService.translate('popups.openmsxmanagement.specialkeyspressed'));
      }
    });
  }

  pressCode() {
    this.launchActivityService.pressCode(this.pid).then(pressed => {
      if (pressed) {
        this.alertMessage.emit(this.localizationService.translate('popups.openmsxmanagement.specialkeyspressed'));
      }
    });
  }
}
