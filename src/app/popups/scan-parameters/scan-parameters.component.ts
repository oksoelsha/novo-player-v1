import { Component, Output, EventEmitter, Input, ChangeDetectorRef, AfterViewInit, OnInit } from '@angular/core';
import { EmulatorService } from '../../services/emulator.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-scan-parameters',
  templateUrl: './scan-parameters.component.html',
  styleUrls: ['../../common-styles.sass', './scan-parameters.component.sass']
})
export class ScanParametersComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() listings: string[] = [];
  @Input() filesAndFolders: string[] = [];
  @Input() currentListing = '';
  @Input() machines: string[] = [];
  @Output() parameters: EventEmitter<ScanParameters> = new EventEmitter<ScanParameters>();

  selectedListing = '';
  selectedMachine = '';

  constructor(protected changeDetector: ChangeDetectorRef, private emulatorService: EmulatorService) {
    super(changeDetector);
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
      if (!this.selectedMachine) {
        this.selectedMachine = data[0];
      }
    });
  }

  close(): void {
    super.close(() => {
      this.filesAndFolders = [];
    });
  }

  removeItem(index: number) {
    this.filesAndFolders.splice(index, 1);
  }

  submitParameters(): void {
    this.parameters.emit(new ScanParameters(this.filesAndFolders, this.selectedListing, this.selectedMachine));
    this.close();
  }
}

export class ScanParameters {
  items: string[];
  listing: string;
  machine: string;

  constructor(items: string[], listing: string, machine: string) {
    this.items = items;
    this.listing = listing;
    this.machine = machine;
  }
}
