import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'longEventDate'
})
export class LongEventDatePipe implements PipeTransform {

  transform(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}
