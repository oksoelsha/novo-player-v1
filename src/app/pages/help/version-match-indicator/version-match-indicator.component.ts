import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VersionUtils } from '../../../models/version-utils';

@Component({
  selector: 'app-help-version-match-indicator',
  templateUrl: './version-match-indicator.component.html',
  styleUrls: ['../../../common-styles.sass', './version-match-indicator.component.sass']
})
export class VersionMatchIndicatorComponent implements OnInit {

  @Input() versions: Promise<any>;
  @Input() downloadButton = false;
  @Input() versionMapKey: string;
  @Output() downloadAction: EventEmitter<void> = new EventEmitter<void>();


  errorConnecting: boolean;
  currentVersion: string;
  newVersionAvailable: boolean;
  versionOnServer: string;

  downloadInProgress = false;

  constructor() { }

  ngOnInit(): void {
    this.versions.then(versions => {
      if (versions[1] instanceof Map) {
        // a Map object means that connecting to the server was successful
        this.processVersions(versions[0], versions[1].get(this.versionMapKey));
      } else {
        this.processErrorConnecting(versions[0]);
      }
    });
  }

  handleDownload() {
    this.downloadAction.emit();
  }

  indicateDownloadStart() {
    this.downloadInProgress = true;
  }

  indicateDownloadDone() {
    this.downloadInProgress = false;
    this.currentVersion = this.versionOnServer;
    this.newVersionAvailable = false;
  }

  private processVersions(currentVersion: string, versionOnServer: string) {
    this.currentVersion = currentVersion;
    this.versionOnServer = versionOnServer;
    this.newVersionAvailable = VersionUtils.isVersionNewer(currentVersion, versionOnServer);
  }

  private processErrorConnecting(currentVersion: string) {
    this.errorConnecting = true;
    this.currentVersion = currentVersion;
  }
}
