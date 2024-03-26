import { Pipe, PipeTransform } from '@angular/core';
import { Game } from '../../../models/game';

@Pipe({
  name: 'screenshotFilename'
})
export class ScreenshotFilenamePipe implements PipeTransform {

  transform(game: Game, screenshotsPath: string): string {
    let screenshotName = screenshotsPath + game.generationMSXId + 'a';
    if (game.screenshotSuffix) {
      screenshotName = screenshotName + game.screenshotSuffix;
    }
    screenshotName = screenshotName + '.png';

    return screenshotName;
  }
}
