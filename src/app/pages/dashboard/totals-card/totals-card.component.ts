import { Component, Input, OnInit } from '@angular/core';
import { ApexChart, ApexStroke, ApexNonAxisChartSeries } from 'ng-apexcharts';
import { Observable } from 'rxjs';
import { Totals } from '../../../models/totals';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-dashboard-totals-card',
  templateUrl: './totals-card.component.html',
  styleUrls: ['../dashboard.component.sass', './totals-card.component.sass']
})
export class TotalsCardComponent implements OnInit {

  @Input() totalsEvent: Observable<Totals>;
  totals: any = [];

  readonly chart: ApexChart = {
    type: 'donut',
    animations: {
      dynamicAnimation: {
        enabled: true,
        speed: 800
      }
    }
  };
  readonly stroke: ApexStroke = {
    width: 0
  };
  readonly labels: string[] = [
    this.localizationService.translate('dashboard.roms'),
    this.localizationService.translate('dashboard.disks'),
    this.localizationService.translate('dashboard.tapes'),
    this.localizationService.translate('dashboard.harddisks'),
    this.localizationService.translate('dashboard.laserdiscs')
  ];
  readonly legend: any = {
    position: 'right',
    fontSize: '12px',
    labels: {
      colors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']
    }
  };
  series: ApexNonAxisChartSeries = [];

  constructor(private localizationService: LocalizationService) { }

  ngOnInit(): void {
    this.totalsEvent.subscribe((totals: Totals) => {
      this.totals = [
        { name: this.localizationService.translate('dashboard.listings'), value: totals.listings },
        { name: this.localizationService.translate('dashboard.games'), value: totals.games },
        { name: this.localizationService.translate('dashboard.roms'), value: totals.roms },
        { name: this.localizationService.translate('dashboard.disks'), value: totals.disks },
        { name: this.localizationService.translate('dashboard.tapes'), value: totals.tapes },
        { name: this.localizationService.translate('dashboard.harddisks'), value: totals.harddisks },
        { name: this.localizationService.translate('dashboard.laserdiscs'), value: totals.laserdiscs }
      ];
      this.series = [totals.roms, totals.disks, totals.tapes, totals.harddisks, totals.laserdiscs];
    });
  }
}

