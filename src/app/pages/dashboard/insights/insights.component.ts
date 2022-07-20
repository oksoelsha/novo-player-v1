import { Component, OnInit } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
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
    height: 185,
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

  readonly colors = ['#dddddd', '#ee4444', '#007bff'];

  readonly series: ApexAxisChartSeries = [
    {
      name: 'openMSX',
      data: []
    },
    {
      name: 'WebMSX',
      data: []
    },
    {
      name: 'blueMSX',
      data: []
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
      color: '#bbbbbb'
    },
    labels: {
      style: {
        colors: '#bbbbbb'
      },
      formatter: function(val) {
        return val.toFixed(0);
      }
    },
    title: {
      text: this.localizationService.translate('dashboard.totalperday'),
      style: {
        color: '#bbbbbb'
      }
    }
  };

  readonly tooltip: ApexTooltip = {
    theme: 'dark'
  };

  readonly legend: ApexLegend = {
    labels: {
      colors: ['#cccccc', '#cccccc', '#cccccc']
    }
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

    this.getLaunchTotalsForLast30Days();
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

  private getLaunchTotalsForLast30Days() {
    this.eventsService.getLaunchTotalsForLast30Days().then((data: any) => {
      this.series[0].data = data.openMSX;
      this.series[1].data = data.WebMSX;
      this.series[2].data = data.blueMSX;
    });
  }
}
