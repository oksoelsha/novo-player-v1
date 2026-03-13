import { Component, OnInit } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { LocalizationService } from '../../../../services/localization.service';
import { EventsService } from '../../../../services/events.service';
import { PlatformService } from '../../../../services/platform.service';

@Component({
  selector: 'app-dashboard-launch-count',
  templateUrl: './launch-count.component.html',
  styleUrls: ['./launch-count.component.sass']
})
export class LaunchCountComponent implements OnInit {

  private readonly isWindows = this.platformService.isOnWindows();
  private readonly blueMSXIndex = 2;

  readonly chart: ApexChart = {
    height: 185,
    type: 'line',
    toolbar: {
      show: false
    }
  };

  readonly stroke: ApexStroke = {
    width: 2,
    curve: 'smooth'
  };

  readonly dataLabels: ApexDataLabels = {
    enabled: false
  };

  readonly colors = ['#dddddd', '#ee4444', '#22aa22', '#985b99ff'];

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
      formatter: (val) => {
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
      colors: ['#cccccc', '#cccccc', '#cccccc', '#cccccc']
    }
  };

  series: ApexAxisChartSeries = [];

  private readonly months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  constructor(private eventsService: EventsService, private localizationService: LocalizationService,
    private platformService: PlatformService) { }

  ngOnInit(): void {
    // initialize the x-axis with the last 30 days in the format 'Mon day'
    const now = Date.now();
    for (let ix = 29; ix >= 0; ix--) {
      const day = new Date(now - 86400000 * ix);
      this.xaxis.categories.push(this.getMonth(day.getMonth()) + ' ' + day.getDate());
    }

    this.getLaunchTotalsForLast30Days();
  }

  private getMonth(monthAsIndex: number): string {
    return this.localizationService.translate('dashboard.' + this.months[monthAsIndex]);
  }

  private getLaunchTotalsForLast30Days() {
    this.eventsService.getLaunchTotalsForLast30Days().then((data: any) => {
      this.series = [
        {
          name: 'openMSX',
          data: data.openMSX
        },
        {
          name: 'WebMSX',
          data: data.WebMSX
        },
        {
          name: 'Emulicious',
          data: data.Emulicious
        },
        {
          name: 'Gearcoleco',
          data: data.Gearcoleco
        }
      ];

      if (this.isWindows) {
        this.colors.splice(this.blueMSXIndex, 0, '#007bff');
        (this.legend.labels.colors as string[]).splice(this.blueMSXIndex, 0, '#cccccc');
        this.series.splice(this.blueMSXIndex, 0, {
          name: 'blueMSX',
          data: data.blueMSX
        });
      }
    });
  }
}
