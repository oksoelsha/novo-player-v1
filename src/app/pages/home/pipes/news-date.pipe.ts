import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newsDate'
})
export class NewsDatePipe implements PipeTransform {

  transform(date: number): string {
    const dateValue = new Date(date);
    return ('0' + dateValue.getDate()).slice(-2) + '-' + ('0' + (dateValue.getMonth() + 1)).slice(-2);
  }
}
