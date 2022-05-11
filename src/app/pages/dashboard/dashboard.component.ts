import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Totals } from '../../models/totals';
import { GamesService } from '../../services/games.service';
import { ScannerService } from '../../services/scanner.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['../../common-styles.sass', './dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {

  totalsSubject: Subject<Totals> = new Subject<Totals>();
  private totalsSubscription: Subscription;

  constructor(private gamesService: GamesService, private scannerService: ScannerService) {
    this.totalsSubscription = this.scannerService.getScannerFinishedEvent().subscribe(() => {
      this.getTotals();
    });
  }

  ngOnInit() {
    this.getTotals();
  }

  ngOnDestroy() {
    this.totalsSubscription.unsubscribe();
  }

  private getTotals() {
    this.gamesService.getTotals().then((totals: Totals) => {
      this.totalsSubject.next(totals);
    });
  }
}
