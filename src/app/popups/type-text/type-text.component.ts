import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PopupComponent } from '../popup.component';
import { LaunchActivityService } from '../../services/launch-activity.service';
import { AlertsService } from '../../shared/components/alerts/alerts.service';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-type-text',
  templateUrl: './type-text.component.html',
  styleUrls: ['./type-text.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeTextComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() pid: number;
  textToType: string;

  constructor(protected changeDetector: ChangeDetectorRef, private launchActivityService: LaunchActivityService,
    private alertService: AlertsService, private localizationService: LocalizationService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    super.open();
  }

  type() {
    this.launchActivityService.typeText(this.pid, this.textToType).then(typed => {
      if (typed) {
        this.alertService.success(this.localizationService.translate('dashboard.texttyped'));
      }
    });
  }

  clear() {
    this.textToType = null;
  }
}
