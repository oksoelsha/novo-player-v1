import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FDDMode } from '../../models/fdd-mode';
import { Game } from '../../models/game';
import { InputDevice } from '../../models/input-device';
import { EmulatorService } from '../../services/emulator.service';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-hardware-edit',
  templateUrl: './hardware-edit.component.html',
  styleUrls: ['./hardware-edit.component.sass']
})
export class HardwareEditComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId!: string;
  @Input() game!: Game;
  @Input() machines: string[] = [];
  @Output() hardwareData: EventEmitter<any> = new EventEmitter<any>();

  selectedMachine = '';
  fddModes: string[] = [];
  selectedFDDMode = '';
  inputDevices: string[] = [];
  inputDeviceVersions = new Map<string, string | null>();
  inputDevicesReverse = new Map<string, number>();
  selectedInputDevice = '';
  connectGFX9000 = false;

  constructor(protected changeDetector: ChangeDetectorRef, private emulatorService: EmulatorService,
    private localizationService: LocalizationService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  open(): void {
    super.reattach();
    super.open();

    this.emulatorService.getMachines().then((data: string[]) => {
      this.machines = data;
      this.selectedMachine = this.game.machine;
    });

    this.fddModes = FDDMode.map(f => this.localizationService.translate('popups.edithardware.' + f));
    if (this.game.fddMode) {
      this.selectedFDDMode = this.localizationService.translate('popups.edithardware.' + FDDMode[this.game.fddMode]);
    } else {
      this.selectedFDDMode = this.localizationService.translate('popups.edithardware.' + FDDMode[0]);
    }

    this.inputDevices = InputDevice.map((f, index) => {
      const parts = f.split(':');
      const device = parts[0];
      let version: string | null = null;
      if (parts.length > 1) {
        version = 'openMSX ' + parts[1] + ' ' + parts[2];
      }
      const translatedDevice = this.localizationService.translate('popups.edithardware.' + device);
      this.inputDeviceVersions.set(translatedDevice, version);
      this.inputDevicesReverse.set(translatedDevice, index++);
      return translatedDevice;
    }).sort();

    if (this.game.inputDevice) {
      this.selectedInputDevice = [...this.inputDevicesReverse.entries()].find(([k, v]) => v === this.game.inputDevice)?.[0]!;
    } else {
      this.selectedInputDevice = this.inputDevices[0];
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
      inputDevice: this.inputDevicesReverse.get(this.selectedInputDevice),
      connectGFX9000: this.connectGFX9000
    });

    this.close();
  }
}
