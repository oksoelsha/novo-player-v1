import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PopupComponent } from '../popup.component';
import { GamePassword, GamePasswordsInfo } from '../../models/game-passwords-info';
import { LaunchActivityService } from '../../services/launch-activity.service';
import { AlertsService } from '../../shared/components/alerts/alerts.service';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-pick-password',
  templateUrl: './pick-password.component.html',
  styleUrls: ['../../common-styles.sass', './pick-password.component.sass']
})
export class PickPasswordComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() pid: number;
  @Input() gamePasswordsInfo: GamePasswordsInfo;
  selectedPassword: GamePassword;

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

  close(): void {
    super.close(() => {
      this.selectedPassword = null;
    });
  }

  enter() {
    if (this.selectedPassword) {
      this.launchActivityService.enterPassword(this.pid, this.selectedPassword).then(entered => {
        if (entered) {
          this.alertService.success(this.localizationService.translate('dashboard.passwordentered'));
        }
      });  
    }
  }
}
