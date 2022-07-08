import { Pipe, PipeTransform } from '@angular/core';
import { Game } from '../../../models/game';
import { SortData, SortDirection } from '../home.component';

@Pipe({
  name: 'sortStatus'
})
export class SortStatusPipe implements PipeTransform {

  transform(field: string, sortData: SortData, refresh: Game[]): string {
    if (sortData.field === field) {
      if (sortData.direction === SortDirection.ASC) {
        return '↑';
      } else {
        return '↓';
      }
    } else {
      return '';
    }
  }
}
