import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.sass']
})
export class PopupComponent {

  @Input () titleHeader: string;
  @Input () popupId: string;
  @Output() openStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ContentChild(TemplateRef) templateVariable: TemplateRef<any>;

  constructor() { }

  commonInit() {
    const self = this;
    window.addEventListener('click', (e: any) => {
      if (e.target === document.getElementById(self.popupId)) {
        self.close();
      }
    });
  }

  commonViewInit() {
    const self = this;
    const popupClose = document.getElementById(this.popupId + '-close');
    if (popupClose) {
      // this is null when running unit tests
      popupClose.addEventListener('click', (e: any) => {
        self.close();
      });  
    }
  }

  open(): void {
    this.openStatus.emit(true);
    document.getElementById(this.popupId).classList.add('popup-fade');
  }

  close(cleanup: () => void = null): void {
    this.openStatus.emit(false);
    const popup = document.getElementById(this.popupId);
    popup.addEventListener('transitionend', (() => {
      let customCleanup = cleanup;
      return () => {
        if (customCleanup !== null) {
          customCleanup();
        }
        popup.removeAllListeners();
      }
    })());
    popup.classList.remove('popup-fade');
  }
}
