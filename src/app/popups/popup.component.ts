import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, EventEmitter, Input, OnDestroy, Output, TemplateRef } from '@angular/core';
import { Utils } from '../models/utils';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupComponent implements OnDestroy {

  @Input () popupId: string;
  @Output() openStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ContentChild(TemplateRef) templateVariable: TemplateRef<any>;
  @Input()
  get titleHeader(): string { return this.titleHeaderValue; }
  set titleHeader(value: string) {
    this.titleHeaderValue = Utils.compressStringIfTooLong(value);
  }
  private titleHeaderValue: string;
  private timer: NodeJS.Timer = null;

  constructor(protected changeDetector: ChangeDetectorRef) {
    this.handleEscape = this.handleEscape.bind(this);
  }

  commonInit() {
    const self = this;
    window.addEventListener('mousedown', (e: any) => {
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
    window.addEventListener('keydown', this.handleEscape);
    this.openStatus.emit(true);
    document.getElementById(this.popupId).classList.add('popup-fade');
    this.changeDetector.reattach();
  }

  close(cleanup: () => void = null): void {
    window.removeEventListener('keydown', this.handleEscape);
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

  alert(message: string) {
    const alertElement = document.getElementById('popup-alert-area');
    alertElement.innerText = message;
    alertElement.classList.add('success-alert');

    if (this.timer != null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      alertElement.innerText = '';
      alertElement.classList.remove('success-alert');
    }, 10000);
  }

  private handleEscape(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.close();
    }
  }
}
