import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { OpenmsxSetupsService } from '../../../services/openmsx-setups.service';
import { OpenmsxSetup } from '../../../models/openmsx-setup';

@Component({
  selector: 'app-quick-launch-setup-save-load',
  templateUrl: './setup-save-load.component.html',
  styleUrls: ['./setup-save-load.component.sass']
})
export class SetupSaveLoadComponent implements OnInit {

  @Input() selectedMachine: string;
  @Input() parameters: string;
  @Input() connectGFX9000: boolean;
  @Output() loadedSetup: EventEmitter<OpenmsxSetup> = new EventEmitter<OpenmsxSetup>();

  @ViewChild('saveSetupDropdown', { static: true }) private saveSetupDropdown: NgbDropdown;
  @ViewChild('deleteSetupDropdown', { static: true }) private deleteSetupDropdown: NgbDropdown;

  name: string;
  savedSetups: OpenmsxSetup[] = [];
  disableSave = true;

  constructor(private openmsxSetupsService: OpenmsxSetupsService) { }

  ngOnInit(): void {
    this.openmsxSetupsService.getSetups().then(setups => {
      this.savedSetups = setups;
    });
  }

  decideIfCanSave() {
    if (this.name) {
      const trimmedName = this.name.trim();
      const empty = trimmedName === '';
      const used = this.savedSetups.find(setup => setup.name === trimmedName) !== undefined;
      this.disableSave = empty || used;
    } else {
      this.disableSave = true;
    }
  }

  save() {
    const setup = new OpenmsxSetup(this.name, this.selectedMachine, this.parameters, this.connectGFX9000);
    this.openmsxSetupsService.save(setup).then(saved => {
      if (saved) {
        this.savedSetups.push(setup);
        this.name = '';
        this.disableSave = true;
        this.saveSetupDropdown.close();
      }
    });
  }

  load(savedSetup: OpenmsxSetup) {
    const selectedSetup = this.savedSetups.find(setup => setup.name === savedSetup.name);
    this.deleteSetupDropdown.close();
    this.loadedSetup.emit(selectedSetup);
  }

  delete(setup: OpenmsxSetup) {
    const selectedSetup = this.savedSetups.find(s => s.name === setup.name);
    this.openmsxSetupsService.delete(selectedSetup).then(deleted => {
      if (deleted) {
        this.savedSetups.splice(this.savedSetups.findIndex((s) => s.name === setup.name), 1);
        this.deleteSetupDropdown.close();
      }
    });
  }
}
