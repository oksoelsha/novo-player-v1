import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OpenMSXUtils } from '../../models/openmsx-utils';
import { QuickLaunchData } from '../../models/quick-launch-data';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-quick-launch',
  templateUrl: './quick-launch.component.html',
  styleUrls: ['./quick-launch.component.sass']
})
export class QuickLaunchComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() machines: string[] = [];
  @Output() gameToLaunch: EventEmitter<QuickLaunchData> = new EventEmitter<QuickLaunchData>();

  file: string;
  selectedMachine: string;
  parameters: string;
  connectGFX9000 = false;

  constructor(protected changeDetector: ChangeDetectorRef) {
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

  launch() {
    const quickLaunchData = new QuickLaunchData(this.file, this.selectedMachine, this.parameters, this.connectGFX9000);
    this.gameToLaunch.emit(quickLaunchData);
  }
}
