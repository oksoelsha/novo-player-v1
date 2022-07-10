import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FDDMode } from '../../models/fdd-mode';
import { Game } from '../../models/game';
import { InputDevice } from '../../models/input-device';
import { EmulatorService } from '../../services/emulator.service';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-hardware-edit',
  templateUrl: './hardware-edit.component.html',
  styleUrls: ['./hardware-edit.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HardwareEditComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @Output() hardwareData: EventEmitter<any> = new EventEmitter<any>();

  machines: string[] = [];
  selectedMachine = '';
  fddModes: string[] = [];
  selectedFDDMode = '';
  inputDevices: string[] = [];
  selectedInputDevice = '';
  connectGFX9000 = false;

  constructor(private changeDetector: ChangeDetectorRef, private emulatorService: EmulatorService,
    private localizationService: LocalizationService) {
    super();
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  open(): void {
    super.open();

    this.emulatorService.getMachines().then((data: string[]) => {
      this.machines = data;
      this.selectedMachine = this.game.machine;
      this.changeDetector.markForCheck();
    });

    this.fddModes = FDDMode.map(f => this.localizationService.translate('popups.edithardware.' + f));
    if (this.game.fddMode) {
      this.selectedFDDMode = this.localizationService.translate('popups.edithardware.' + FDDMode[this.game.fddMode]);
    } else {
      this.selectedFDDMode = this.localizationService.translate('popups.edithardware.' + FDDMode[0]);
    }

    this.inputDevices = InputDevice.map(f => this.localizationService.translate('popups.edithardware.' + f));
    if (this.game.inputDevice) {
      this.selectedInputDevice = this.localizationService.translate('popups.edithardware.' + InputDevice[this.game.inputDevice]);
    } else {
      this.selectedInputDevice = this.localizationService.translate('popups.edithardware.' + InputDevice[0]);
    }

    if (this.game.connectGFX9000) {
      this.connectGFX9000 = this.game.connectGFX9000;
    } else {
      this.connectGFX9000 = false;
    }
  }

  save() {
    this.hardwareData.emit({
      machine: this.selectedMachine,
      fddMode: this.fddModes.indexOf(this.selectedFDDMode),
      inputDevice: this.inputDevices.indexOf(this.selectedInputDevice),
      connectGFX9000: this.connectGFX9000
    });

    this.close();
  }
}
