import { Component, OnInit } from '@angular/core';
import { Error } from '../../../../models/error';
import { EventsService } from '../../../../services/events.service';

@Component({
  selector: 'app-dashboard-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.sass']
})
export class ErrorsComponent implements OnInit {

  readonly pageSize = 5;
  errors: Error[] = [];
  total = 0;

  constructor(private eventsService: EventsService) { }

  ngOnInit(): void {
    this.getErrors(0);
  }

  getErrors(page: number) {
    this.eventsService.getErrors(this.pageSize, page).then((data: any) => {
      this.total = data.total;
      this.errors = data.errors;
    });
  }
}
