import { Pipe, PipeTransform } from '@angular/core';
import { Game } from '../../../models/game';

@Pipe({
  name: 'screenshotFilename'
})
export class ScreenshotFilenamePipe implements PipeTransform {

  transform(game: Game, screenshotsPath: string, colecoScreenshotsPath: string, spectravideoScreenshotsPath: string,
    segaScreenshotsPath: string): string {
    let screenshotName: string;
    if (game.colecoScreenshot) {
      screenshotName = colecoScreenshotsPath + game.colecoScreenshot + '_a.png';
    } else if (game.spectravideoScreenshot) {
      screenshotName = spectravideoScreenshotsPath + game.spectravideoScreenshot + '_a.png';
    } else if (game.segaScreenshot) {
      screenshotName = segaScreenshotsPath + game.segaScreenshot + '_a.png';
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
