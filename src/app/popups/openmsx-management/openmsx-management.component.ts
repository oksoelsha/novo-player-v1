import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PopupComponent } from '../popup.component';
import { LaunchActivityService, OpenmsxEvent as OpenmsxEvent } from '../../services/launch-activity.service';

@Component({
  selector: 'app-openmsx-management',
  templateUrl: './openmsx-management.component.html',
  styleUrls: ['./openmsx-management.component.sass']
})
export class OpenmsxManagementComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() pid: number;
  @Input()
  get event(): OpenmsxEvent { return this.eventInputValue; }
  set event(value: OpenmsxEvent) {
    this.eventInputValue = value;
    this.processEvents();
  }
  private eventInputValue: OpenmsxEvent;

  powerLed: boolean;
  fddLed: boolean;
  capsLed: boolean;
  langLed: boolean;
  turboLed: boolean;

  constructor(protected changeDetector: ChangeDetectorRef, private launchActivityService: LaunchActivityService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    setTimeout(() => {
      const currentStatus = this.launchActivityService.getOpenmsxCurrentStatus(this.pid);
      if (currentStatus) {
        this.powerLed = currentStatus.has('power');
        this.fddLed = currentStatus.has('FDD');
        this.capsLed = currentStatus.has('caps');
        this.langLed = currentStatus.has('kana');
        this.turboLed = currentStatus.has('turbo');
      }
    }, 0);

    super.open();
  }

  private processEvents() {
    if (this.eventInputValue && this.pid === this.eventInputValue.pid) {
      if (this.eventInputValue.name === 'power') {
        this.powerLed = this.eventInputValue.on;
      } else if (this.eventInputValue.name === 'FDD') {
        this.fddLed = this.eventInputValue.on;
      } else if (this.eventInputValue.name === 'caps') {
        this.capsLed = this.eventInputValue.on;
      } else if (this.eventInputValue.name === 'kana') {
        this.langLed = this.eventInputValue.on;
      } else if (this.eventInputValue.name === 'turbo') {
        this.turboLed = this.eventInputValue.on;
      }
    }
  }
}
