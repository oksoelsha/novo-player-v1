import { Pipe, PipeTransform } from '@angular/core';
import { Game } from '../../models/game';

@Pipe({
  name: 'gameCompanyAndYear'
})
export class GameCompanyAndYearPipe implements PipeTransform {

  transform(game: Game): string {
    return this.getValue(game.company) + ' - ' + this.getValue(game.year);
  }

  private getValue(value: string): string {
    if (value != null && String(value).trim() !== '') {
      return value;
    } else {
      return '';
    }
  }
}
