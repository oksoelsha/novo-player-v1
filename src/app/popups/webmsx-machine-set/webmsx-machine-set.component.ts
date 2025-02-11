import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from '../../models/game';
import { WebMSXMachinesData, WebMSXUtils } from '../../models/webmsx-utils';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-webmsx-machine-set',
  templateUrl: './webmsx-machine-set.component.html',
  styleUrls: ['../../common-styles.sass', './webmsx-machine-set.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebmsxMachineSetComponent  extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @Output() webmsxMachine: EventEmitter<number> = new EventEmitter<number>();

  readonly machines: string[];
  selectedMachineValue: number;
  selectedMachineLabel: string;

  constructor(protected changeDetector: ChangeDetectorRef, private localizationService: LocalizationService) {
    super(changeDetector);

    this.machines = WebMSXUtils.getMachineLabels();
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  open(): void {
    super.reattach();
    this.setSelectionFromValue(this.game.webmsxMachine);
    super.open();
  }

  getMachineLabel(index: number): string {
    return WebMSXMachinesData[index].label;
  }

  setSelectionFromLabel(label: string) {
    if (label) {
      this.selectedMachineValue = WebMSXUtils.getMachineValueFromLabel(label);
      this.selectedMachineLabel = label;
    } else {
      this.selectedMachineValue = 0;
      this.selectedMachineLabel = this.localizationService.translate('webmsx.settodefault');
    }
  }

  setSelectionFromValue(value: number) {
    if (value > 0) {
      this.selectedMachineValue = value;
      this.selectedMachineLabel = WebMSXUtils.getLabelFromMachineValue(value);
    } else {
      this.selectedMachineValue = 0;
      this.selectedMachineLabel = this.localizationService.translate('webmsx.settodefault');
    }
  }

  save() {
    this.webmsxMachine.emit(this.selectedMachineValue);
    this.close();
  }
}
