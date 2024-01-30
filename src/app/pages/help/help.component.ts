import { Component, OnInit, ViewChild } from '@angular/core';
import { VersionsService } from '../../services/versions.service';
import { DownloadService } from '../../services/download.service';
import { VersionMatchIndicatorComponent } from './version-match-indicator/version-match-indicator.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['../../common-styles.sass', './help.component.sass']
})
export class HelpComponent implements OnInit {

  @ViewChild('extraDataVersionIndicator') extraDataVersionIndicator: VersionMatchIndicatorComponent;

  readonly applicationVersion = '1.9';

  applicationVersions: Promise<any>;
  extraDataVersions: Promise<any>;
  screenshotsVersions: Promise<any>;
  gameMusicVersions: Promise<any>;

  downloadNewExtraDataFailed = false;

  constructor(private versionsService: VersionsService, private downloadService: DownloadService) { }

  ngOnInit(): void {
    const versionsOnServer = this.versionsService.getVersionsOnServer();

    this.applicationVersions = Promise.all([
      Promise.resolve(this.applicationVersion),
      versionsOnServer.catch(error => error)
    ]);

    this.extraDataVersions = Promise.all([
      Promise.resolve(this.versionsService.getExtraDataVersion()),
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

  downloadNewExtraData() {
    this.extraDataVersionIndicator.indicateDownloadStart();
    this.downloadService.downloadNewExtraData().then(() => {
      this.extraDataVersionIndicator.indicateDownloadDone();
    }).catch(error => {
      this.downloadNewExtraDataFailed = true;
    });
  }
}
