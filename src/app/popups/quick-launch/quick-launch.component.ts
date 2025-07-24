import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { OpenMSXUtils } from '../../models/openmsx-utils';
import { QuickLaunchData } from '../../models/quick-launch-data';
import { PopupComponent } from '../popup.component';
import { GamesService } from '../../services/games.service';
import { LocalizationService } from '../../services/localization.service';
import { AlertsService } from '../../shared/components/alerts/alerts.service';

@Component({
  selector: 'app-quick-launch',
  templateUrl: './quick-launch.component.html',
  styleUrls: ['./quick-launch.component.sass']
})
export class QuickLaunchComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() machines: string[] = [];
  @Input() showFileHunterGames: boolean;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  file: string;
  selectedMachine: string;
  parameters: string;
  connectGFX9000 = false;

  constructor(protected changeDetector: ChangeDetectorRef, private gamesService: GamesService,
    private localizationService: LocalizationService, private alertService: AlertsService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
    this.selectedMachine = 'Boosted_MSX2_EN';
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  open(): void {
    super.reattach();
    super.open();
  }

  getOpenMSXArgumentsMap(): Map<string, string[]> {
    return OpenMSXUtils.getCommandLineArgumentsMap();
  }

  setOpenmsxParams(parameters: string) {
    this.parameters = parameters;
  }

  highlightFileInput() {
    this.fileInput.nativeElement.select();
  }

  launch() {
    let sanitizedFile: string;
    if (this.file?.startsWith('https://')) {
      sanitizedFile = decodeURIComponent(this.file);
    } else {
      sanitizedFile = this.file;
    }
    const quickLaunchData = new QuickLaunchData(sanitizedFile, this.selectedMachine, this.parameters, this.connectGFX9000);
    this.gamesService.quickLaunchOnOpenMSX(quickLaunchData).then((errorMessage: string) => {
      if (errorMessage) {
        this.alertService.failure(this.localizationService.translate('home.failedtostartopenmsx') +
        ' [' + errorMessage + ']');
      } else {
        this.alertService.info(this.localizationService.translate('home.openmsxwindowclosed'));
      }
    }).catch((error) => {
      // These errors are returned by service before openMSX is even started
      let translatedError: string;
      if (error === 'ERR_DOWNLOAD_FAILED') {
        translatedError = this.localizationService.translate('common.errordownloading');
      } else if (error === 'ERR_INVALID_FILE') {
        translatedError = this.localizationService.translate('popups.quicklaunch.invalidfile');
      } else {
        translatedError = this.localizationService.translate('popups.quicklaunch.unknownerror');
      }
      super.alertFailure(translatedError);
    });
  }
}
