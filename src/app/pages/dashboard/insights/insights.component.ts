import { Component, OnInit } from '@angular/core';

enum DisplayModes {topTen, launchTimes}

@Component({
  selector: 'app-dashboard-insights-card',
  templateUrl: './insights.component.html',
  styleUrls: ['../../../common-styles.sass', '../dashboard.component.sass', './insights.component.sass']
})
export class InsightsComponent implements OnInit {

  private currentDisplayMode: DisplayModes;

  constructor() { }

  ngOnInit(): void {
    this.currentDisplayMode = DisplayModes.topTen;
  }

  isTopTenMode(): boolean {
    return this.currentDisplayMode === DisplayModes.topTen;
  }

  isLaunchTimesMode(): boolean {
    return this.currentDisplayMode === DisplayModes.launchTimes;
  }

  setTopTenMode() {
    this.currentDisplayMode = DisplayModes.topTen;
  }

  setLaunchTimesMode() {
    this.currentDisplayMode = DisplayModes.launchTimes;
  }
}
