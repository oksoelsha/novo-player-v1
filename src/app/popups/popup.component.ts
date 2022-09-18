import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, EventEmitter, Input, OnDestroy, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupComponent implements OnDestroy {

  @Input () titleHeader: string;
  @Input () popupId: string;
  @Output() openStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ContentChild(TemplateRef) templateVariable: TemplateRef<any>;

  constructor(protected changeDetector: ChangeDetectorRef) {}

  commonInit() {
    const self = this;
    window.addEventListener('click', (e: any) => {
      if (e.target === document.getElementById(self.popupId)) {
        self.close();
      }
    });
    this.changeDetector.detach();
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

  ngOnDestroy(): void {
    window.removeAllListeners();
  }

  open(): void {
    this.openStatus.emit(true);
    document.getElementById(this.popupId).classList.add('popup-fade');
    this.changeDetector.reattach();
  }

  close(cleanup: () => void = null): void {
    this.openStatus.emit(false);
    const popup = document.getElementById(this.popupId);
    popup.addEventListener('transitionend', (() => {
      const customCleanup = cleanup;
      return () => {
        if (customCleanup !== null) {
          customCleanup();
        }
        popup.removeAllListeners();
      };
    })());
    popup.classList.remove('popup-fade');
    this.changeDetector.detach();
  }
}
