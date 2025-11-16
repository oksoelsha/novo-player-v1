import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LaunchActivityService } from '../../../services/launch-activity.service';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-openmsx-management-export',
  templateUrl: './export.component.html',
  styleUrls: ['../openmsx-management.component.sass', './export.component.sass']
})
export class ExportComponent {

  @Input() pid: number;
  @Output() alertMessage: EventEmitter<string> = new EventEmitter<string>();

  constructor(private launchActivityService: LaunchActivityService, private localizationService: LocalizationService) { }

  copyBASICListing() {
    this.launchActivityService.copyBASICListing(this.pid).then(result => {
      if (result.success && result.content) {
        this.alertMessage.emit(this.localizationService.translate('popups.openmsxmanagement.basiclistingcopied'));
      }
    });
  }
}
