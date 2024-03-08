import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['../../../common-styles.sass', './drop-down.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropDownComponent {

  @Input() list: string[];
  @Input() listIcons: string[];
  @Input() selectedItem: string;
  @Input() defaultLabel: string;
  @Input() resetButton: boolean;
  @Input() doNotDisplaySelectedItem: boolean;
  @Output() selection: EventEmitter<string> = new EventEmitter<string>();
  @Output() openStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChildren('dropDownItem') dropDownItems: QueryList<ElementRef>;

  private accumulatedPressedKeys = '';
  private quickTypeTimer: NodeJS.Timer = null;

  constructor() { }

  processKeyup(event: KeyboardEvent) {
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && (
      (event.key >= 'a' && event.key <= 'z') || (event.key >= '0' && event.key <= '9') ||
      (event.key >= 'A' && event.key <= 'Z'))) {
        if (this.quickTypeTimer != null) {
          clearTimeout(this.quickTypeTimer);
        }
        this.accumulatedPressedKeys += event.key;
        this.quickTypeTimer = setTimeout(() => {
          this.jumpToNearestItem(this.accumulatedPressedKeys);
          this.accumulatedPressedKeys = '';
        }, 300);
      } else if (event.key === 'Enter') {
        event.stopPropagation();
      }
  }

  handleSelection(selection: string) {
    if (!this.doNotDisplaySelectedItem) {
      this.selectedItem = selection;
    }
    this.selection.emit(selection);
  }

  resetSelection() {
    this.selectedItem = '';
    this.selection.emit('');
  }

  emitOpenStatus(open: boolean) {
    if (open && this.selectedItem) {
      setTimeout(() => {
        this.jumpToExacttItem(this.selectedItem);
      }, 0);
    }
    this.openStatus.emit(open);
  }

  private jumpToNearestItem(accumulatedPressedKeys: string) {
    let index: number;
    for (index = 0; index < this.list.length &&
      !this.list[index].toLowerCase().startsWith(accumulatedPressedKeys.toLowerCase()); index++) {}
      this.goToMenuItem(index);
    }

  private jumpToExacttItem(item: string) {
    let index: number;
    for (index = 0; index < this.list.length && this.list[index] !== item; index++) {}
    this.goToMenuItem(index);
  }

  private goToMenuItem(index: number) {
    if (index < this.list.length) {
      this.dropDownItems.toArray()[index].nativeElement.focus();
    }
  }
}
