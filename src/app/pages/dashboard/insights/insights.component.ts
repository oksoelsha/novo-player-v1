import { Component, OnInit } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { EventsService } from '../../../services/events.service';
import { LocalizationService } from '../../../services/localization.service';

enum DisplayModes {topTen, launchTimes}

@Component({
  selector: 'app-dashboard-insights-card',
  templateUrl: './insights.component.html',
  styleUrls: ['../../../common-styles.sass', '../dashboard.component.sass', './insights.component.sass']
})
export class InsightsComponent implements OnInit {

  readonly pageSize = 5;
  topTenList: any[] = [];
  total = 0;

  readonly chart: ApexChart = {
    height: 180,
    type: 'line',
    toolbar: {
      show: false
    }
  };

  readonly stroke: ApexStroke = {
    width: 2
  };

  readonly dataLabels: ApexDataLabels = {
    enabled: false
  };

  readonly colors = ['#cccccc'];

  readonly series: ApexAxisChartSeries = [
    {
      name: 'Total Launches',
      data: [0, 0, 0, 0, 0, 0, 4, 10, 5, 19, 1, 7, 2, 2, 3, 0, 4, 10, 5, 12, 1, 7, 2, 2, 3, 0, 4, 10, 5, 12]
    }
  ];

  readonly xaxis: ApexXAxis = {
    categories: [],
    labels: {
      show: false
    }
  };

  readonly yaxis: ApexYAxis = {
    axisTicks: {
      show: true
    },
    axisBorder: {
      show: true,
      color: '#cccccc'
    },
    labels: {
      style: {
        colors: '#cccccc'
      }
    },
    title: {
      text: 'Total Launches',
      style: {
        color: '#cccccc'
      }
    }
  };

  readonly tooltip: ApexTooltip = {
    theme: 'dark'
  };

  private cachedTopTenPageList: any[] = new Array(2);
  private currentDisplayMode: DisplayModes;
  private readonly months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  constructor(private eventsService: EventsService, private localizationService: LocalizationService) { }

  ngOnInit(): void {
    this.currentDisplayMode = DisplayModes.topTen;
    this.getTopTenLaunchedGames(0);

    // initialize the x-axis with the last 30 days in the format 'Mon day'
    const now = Date.now();
    for (let ix = 29; ix >= 0; ix--) {
      const day = new Date(now - 86400000 * ix);
      this.xaxis.categories.push(this.getMonth(day.getMonth()) + ' ' + day.getDate());
    }
  }

  getTopTenLaunchedGames(page: number) {
    if (this.cachedTopTenPageList[page] != null) {
      this.topTenList = this.cachedTopTenPageList[page];
    } else {
      this.eventsService.getTopTenLaunchedGames(this.pageSize, page).then((data: any) => {
        this.total = data.total;
        this.topTenList = data.counts;
        this.cachedTopTenPageList[page] = data.counts;
      });
    }
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

  private getMonth(monthAsIndex: number): string {
    return this.localizationService.translate('dashboard.' + this.months[monthAsIndex]);
  }
}
