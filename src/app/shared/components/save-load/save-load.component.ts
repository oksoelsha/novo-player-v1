import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-save-load',
  templateUrl: './save-load.component.html',
  styleUrls: ['../../../common-styles.sass', './save-load.component.sass']
})
export class SaveLoadComponent {

  @Input() savedList: any[] = [];
  @Input() saveTooltip: string;
  @Input() loadTooltip: string;
  @Output() itemToLoad: EventEmitter<any> = new EventEmitter<any>();
  @Output() nameToSave: EventEmitter<string> = new EventEmitter<string>();
  @Output() itemToDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() openStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('saveDropdown', { static: true }) private saveDropdown: NgbDropdown;
  @ViewChild('deleteDropdown', { static: true }) private deleteDropdown: NgbDropdown;

  name = '';
  disableSave = true;

  constructor() { }

  emitOpenStatus(open: boolean) {
    this.openStatus.emit(open);
  }

  decideIfCanSave() {
    if (this.name) {
      const trimmedName = this.name.trim();
      const empty = trimmedName === '';
      const used = this.savedList.find(item => item.name === trimmedName) !== undefined;
      this.disableSave = empty || used;
    } else {
      this.disableSave = true;
    }
  }

  save(event: any) {
    if (event instanceof KeyboardEvent) {
      event.stopPropagation();
    }
    this.nameToSave.emit(this.name);
    this.name = '';
    this.disableSave = true;
    this.saveDropdown.close();
  }

  load(savedItem: any) {
    this.itemToLoad.emit(savedItem);
    this.deleteDropdown.close();
  }

  delete(savedItem: any) {
    this.itemToDelete.emit(savedItem);
    this.deleteDropdown.close();
  }
}
