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
  private popupElement: HTMLElement;
  private titleHeaderValue: string;
  private timer: NodeJS.Timer = null;
  private isOpen = false;

  constructor(protected changeDetector: ChangeDetectorRef) {
    this.handleKeyEvent = this.handleKeyEvent.bind(this);
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

  reattach(): void {
    // this must be called by the child class's open method at the beginning
    this.changeDetector.reattach();
  }

  open(): void {
    this.isOpen = true;
    window.addEventListener('keydown', this.handleKeyEvent);
    this.openStatus.emit(true);
    this.popupElement = document.getElementById(this.popupId);
    this.popupElement.classList.add('popup-fade');
  }

  close(cleanup: () => void = null): void {
    this.isOpen = false;
    window.removeEventListener('keydown', this.handleKeyEvent);
    this.openStatus.emit(false);
    this.popupElement.addEventListener('transitionend', (() => {
      const customCleanup = cleanup;
      return () => {
        if (customCleanup !== null) {
          customCleanup();
        }
        this.popupElement.removeAllListeners();
      };
    })());
    this.popupElement.classList.remove('popup-fade');
    this.changeDetector.detach();
  }

  alertSuccess(message: string) {
    this.alert(message, 'success-alert');
  }

  alertFailure(message: string) {
    this.alert(message, 'failure-alert');
  }

  protected isWindowOpen(): boolean {
    return this.isOpen;
  }

  protected handleKeyEvent(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.close();
    } else if (!this.popupElement.contains(e.target as Node)) {
      // if the key event occurs outside of the open popup, prevent the event from bubbling up.
      // that prevents arraow keys, for example, from scrolling the page outside the popup
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private alert(message: string, classname: string) {
    const alertElement = document.getElementById(this.popupId + '-popup-alert-area');
    alertElement.innerText = message;
    alertElement.classList.add(classname);

    if (this.timer != null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      alertElement.innerText = '';
      alertElement.classList.remove(classname);
    }, 10000);
  }
}
