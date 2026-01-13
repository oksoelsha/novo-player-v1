import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { VersionsService } from '../../services/versions.service';
import { VersionMatchIndicatorComponent } from './version-match-indicator/version-match-indicator.component';
import { WindowService } from '../../services/window.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['../../common-styles.sass', './help.component.sass']
})
export class HelpComponent implements OnInit {

  @ViewChild('extraDataVersionIndicator') extraDataVersionIndicator: VersionMatchIndicatorComponent;

  readonly applicationVersion = '1.14';

  applicationVersions: Promise<any>;
  screenshotsVersions: Promise<any>;
  gameMusicVersions: Promise<any>;
  colecoScreenshotsVersions: Promise<any>;
  spectravideoScreenshotsVersions: Promise<any>;

  constructor(private versionsService: VersionsService, private windowService: WindowService) { }

  @HostListener('window:keydown', ['$event'])
  keydownEvent(event: any) {
    if (!event.repeat && (event.ctrlKey || event.metaKey) && event.key === '=') {
        this.windowService.zoomIn();
    }
  }

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

    this.colecoScreenshotsVersions = Promise.all([
      this.versionsService.getColecoScreenshotsVersion(),
      versionsOnServer.catch(error => error)
    ]);

    this.spectravideoScreenshotsVersions = Promise.all([
      this.versionsService.getSpectravideoScreenshotsVersion(),
      versionsOnServer.catch(error => error)
    ]);
  }
}
