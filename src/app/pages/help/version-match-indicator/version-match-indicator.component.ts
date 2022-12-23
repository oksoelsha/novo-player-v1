import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-version-match-indicator',
  templateUrl: './version-match-indicator.component.html',
  styleUrls: ['./version-match-indicator.component.sass']
})
export class VersionMatchIndicatorComponent implements OnInit {

  @Input() versions: Promise<any>;
  @Input() versionMapKey: string;

  showData: boolean;
  errorConnecting: boolean;
  currentVersion: string;
  newVersionAvailable: boolean;
  versionOnServer: string;

  constructor() { }

  ngOnInit(): void {
    this.versions.then(versions => {
      if (versions[1] instanceof Map) {
        // a Map object means that connecting to the server was successful
        this.processVersions(versions[0], versions[1].get(this.versionMapKey));
      } else {
        this.processErrorConnecting(versions[0]);
      }
      this.showData = true;
    });
  }

  private processVersions(currentVersion: string, versionOnServer: string) {
    this.currentVersion = currentVersion;
    this.versionOnServer = versionOnServer;
    this.newVersionAvailable = this.getAsInteger(currentVersion) < this.getAsInteger(versionOnServer);
  }

  private processErrorConnecting(currentVersion: string) {
    this.errorConnecting = true;
    this.currentVersion = currentVersion;
  }

  private getAsInteger(version: string): number {
    return Number.parseInt(version.replace(/\./,''));
  }
}
