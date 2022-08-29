import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from '../../models/game';
import { WebMSXMachineDisplayLabel } from '../../models/webmsx-machines';
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

  readonly machines = WebMSXMachineDisplayLabel;
  selectedMachine: number;
  selectedMachineDisplayLabel: string;

  constructor(private changeDetector: ChangeDetectorRef, private localizationService: LocalizationService) {
    super();
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  open(): void {
    this.setSelectedMachine(this.game.webmsxMachine);

    super.open();
  }

  getMachineDisplayLabel(index: number): string {
    return WebMSXMachineDisplayLabel[index];
  }

  setSelectedMachine(index: number) {
    this.selectedMachine = index;
    if (index) {
      this.selectedMachineDisplayLabel = WebMSXMachineDisplayLabel[index];
    } else {
      this.selectedMachineDisplayLabel = this.localizationService.translate('webmsx.settodefault');
    }
  }

  save() {
    this.webmsxMachine.emit(this.selectedMachine);
    this.close();
  }
}
