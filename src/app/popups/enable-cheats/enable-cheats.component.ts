import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PopupComponent } from '../popup.component';
import { LaunchActivityService } from '../../services/launch-activity.service';

@Component({
  selector: 'app-enable-cheats',
  templateUrl: './enable-cheats.component.html',
  styleUrls: ['../../common-styles.sass', './enable-cheats.component.sass']
})
export class EnableCheatsComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() pid: number;
  @Input() gameName: string;
  trainer: any[];

  constructor(protected changeDetector: ChangeDetectorRef, private launchActivityService: LaunchActivityService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    setTimeout(() => {
      this.launchActivityService.getTrainer(this.pid, this.gameName).then((trainer: any[]) => {
        this.trainer = trainer;
      });
    }, 0);

    super.open();
  }

  setCheat(cheat: string) {
    this.launchActivityService.setCheat(this.pid, this.gameName, cheat).then((success: boolean) => {
    });
  }
}
