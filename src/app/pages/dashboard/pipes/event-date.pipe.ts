import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eventDate'
})
export class EventDatePipe implements PipeTransform {

  transform(timestamp: number): string {
    const date = new Date(timestamp);
    return ('0' + date.getDate()).slice(-2) + '-' + (date.getMonth() + 1) + ' ' +
      ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  }
}
