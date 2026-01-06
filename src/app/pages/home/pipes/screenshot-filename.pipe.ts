import { Pipe, PipeTransform } from '@angular/core';
import { Game } from '../../../models/game';

@Pipe({
  name: 'screenshotFilename'
})
export class ScreenshotFilenamePipe implements PipeTransform {

  transform(game: Game, screenshotsPath: string, colecoScreenshotsPath: string): string {
    let screenshotName: string;
    if (game.colecoScreenshot) {
      screenshotName = colecoScreenshotsPath + game.colecoScreenshot + '_a.png';
    } else {
      screenshotName = screenshotsPath + game.generationMSXId + 'a';
      if (game.screenshotSuffix) {
        screenshotName = screenshotName + game.screenshotSuffix;
      }
      screenshotName = screenshotName + '.png';
    }

    return screenshotName;
  }
}
