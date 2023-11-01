import { Component, OnInit } from '@angular/core';
import { Event, EventSource } from '../../../../models/event';
import { EventsService } from '../../../../services/events.service';

@Component({
  selector: 'app-dashboard-launch-history',
  templateUrl: './launch-history.component.html',
  styleUrls: ['./launch-history.component.sass']
})
export class LaunchHistoryComponent implements OnInit {

  readonly pageSize = 5;
  launchHistory: Event[] = [];
  total = 0;

  constructor(private eventsService: EventsService) { }

  ngOnInit(): void {
    this.getEvents(0);
  }

  getEvents(page: number) {
    this.eventsService.getEvents(this.pageSize, page).then((data: any) => {
      this.total = data.total;
      this.launchHistory = data.events;
    });
  }

  getLaunchSource(source: number): string {
    return EventSource[source];
  }
}
