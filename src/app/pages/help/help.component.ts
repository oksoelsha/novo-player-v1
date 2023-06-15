import { Component, OnInit } from '@angular/core';
import { VersionsService } from '../../services/versions.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['../../common-styles.sass', './help.component.sass']
})
export class HelpComponent implements OnInit {

  readonly applicationVersion = '1.5.1';

  applicationVersions: Promise<any>;
  screenshotsVersions: Promise<any>;
  gameMusicVersions: Promise<any>;

  constructor(private versionsService: VersionsService) { }

  ngOnInit(): void {
    const versionsOnServer = this.versionsService.getVersionsOnServer();

    this.applicationVersions = Promise.all([
      Promise.resolve(this.applicationVersion),
      versionsOnServer.catch(error => error)
    ]);

    this.screenshotsVersions = Promise.all([
      this.versionsService.getScreenshotsVersion(),
      versionsOnServer.catch(error => error)
    ]);

    this.gameMusicVersions = Promise.all([
      this.versionsService.getGameMusicVersion(),
      versionsOnServer.catch(error => error)
    ]);
  }
}
