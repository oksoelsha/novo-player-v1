import { Component, OnInit } from '@angular/core';

enum DisplayModes {launchHistory, errors}

@Component({
  selector: 'app-dashboard-events-card',
  templateUrl: './events.component.html',
  styleUrls: ['../../../common-styles.sass', '../dashboard.component.sass', './events.component.sass']
})
export class EventsComponent implements OnInit {

  private currentDisplayMode: DisplayModes;

  constructor() { }

  ngOnInit(): void {
    this.currentDisplayMode = DisplayModes.launchHistory;
  }

  isLaunchHistoryMode(): boolean {
    return this.currentDisplayMode === DisplayModes.launchHistory;
  }

  isErrorsMode(): boolean {
    return this.currentDisplayMode === DisplayModes.errors;
  }

  setLaunchHistoryMode() {
    this.currentDisplayMode = DisplayModes.launchHistory;
  }

  setErrorsMode() {
    this.currentDisplayMode = DisplayModes.errors;
  }
}
