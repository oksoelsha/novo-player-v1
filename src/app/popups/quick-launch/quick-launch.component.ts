import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  constructor(protected changeDetector: ChangeDetectorRef) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  getOpenMSXArgumentsMap(): Map<string, string[]> {
    const commandLineArguments = new Map<string, string[]>();
    const romTypes = [
      'ASCII8',
      'ASCII16',
      'KonamiSCC',
      'page23'
    ];
    const extensions = [
      'scc',
      'scc+'
    ];

    commandLineArguments.set('carta', []);
    commandLineArguments.set('cartb', []);
    commandLineArguments.set('command', []);
    commandLineArguments.set('diska', []);
    commandLineArguments.set('diskb', []);
    commandLineArguments.set('ext', extensions);
    commandLineArguments.set('ips', []);
    commandLineArguments.set('romtype', romTypes);
    commandLineArguments.set('script', []);

    return commandLineArguments;
  }

  setOpenmsxParams(parameters: string) {
    this.parameters = parameters;
  }

  launch() {
    const quickLaunchData = new QuickLaunchData(this.file, this.selectedMachine, this.parameters);
    this.gameToLaunch.emit(quickLaunchData);
  }
}
