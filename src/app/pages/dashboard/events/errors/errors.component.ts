import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Error } from '../../../../models/error';
import { EventsService } from '../../../../services/events.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['../../dashboard.component.sass', './errors.component.sass']
})
export class ErrorsComponent implements OnInit, OnDestroy {

  readonly pageSize = 5;
  errors: Error[] = [];
  total = 0;
  private currentPage: number;
  private newErrorSubscription: Subscription;

  constructor(private eventsService: EventsService, private ngZone: NgZone) {
    this.newErrorSubscription = this.eventsService.getNewErrorNotification().subscribe(() => {
      this.ngZone.run(() => {
        this.getErrors(this.currentPage);
      });
    });
  }

  ngOnInit(): void {
    this.getErrors(0);
  }

  ngOnDestroy() {
    this.newErrorSubscription.unsubscribe();
  }

  getErrors(page: number) {
    this.currentPage = page;
    this.eventsService.getErrors(this.pageSize, page).then((data: any) => {
      this.total = data.total;
      this.errors = data.errors;
    });
  }
}
