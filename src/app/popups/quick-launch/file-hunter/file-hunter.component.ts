import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

enum DisplayModes {list, newAdditions}

@Component({
  selector: 'app-file-hunter',
  templateUrl: './file-hunter.component.html',
  styleUrls: ['../../../common-styles.sass', './file-hunter.component.sass']
})
export class FileHunterComponent implements OnInit {

  @Output() gameLink: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('fileHunterDropdown', { static: true }) private fileHunterDropdown!: NgbDropdown;

  openedSubject = new Subject<void>();
  private currentDisplayMode!: DisplayModes;

  constructor() { }

  ngOnInit(): void {
    this.currentDisplayMode = DisplayModes.list;
  }

  isListMode(): boolean {
    return this.currentDisplayMode === DisplayModes.list;
  }

  isNewAdditionsMode(): boolean {
    return this.currentDisplayMode === DisplayModes.newAdditions;
  }

  setListMode() {
    this.currentDisplayMode = DisplayModes.list;
  }

  setNewAdditionsMode() {
    this.openedSubject.next();
    this.currentDisplayMode = DisplayModes.newAdditions;
  }

  selectLink(link: string) {
    this.gameLink.emit(link);
    this.fileHunterDropdown.close();
  }
}
