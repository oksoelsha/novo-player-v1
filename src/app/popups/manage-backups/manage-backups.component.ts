import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Backup } from '../../models/backup';
import { BackupsService } from '../../services/backups.service';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-manage-backups',
  templateUrl: './manage-backups.component.html',
  styleUrls: ['../../common-styles.sass', './manage-backups.component.sass']
})
export class ManageBackupsComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Output() dataRestored: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('backupRenameInput', { static: false }) private backupRenameInput: ElementRef;
  @ViewChild('backupsTable', { static: true }) private backupsTable: ElementRef;

  renamedBackup: string;
  restoreMode = false;
  renameMode = false;
  deleteMode = false;
  errorMode = false;
  backups: Backup[] = [];
  selectedBackup: Backup;
  backupsSelectionMap: Map<number, boolean> = new Map();
  backupTaken = false;

  constructor(protected changeDetector: ChangeDetectorRef, private backupsService: BackupsService,
    private localizationService: LocalizationService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
    this.backupsService.getBackups().then(backups => {
      this.backups = backups;
      this.backups.sort((a, b) => a.timestamp - b.timestamp);
    });
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  close(): void {
    super.close(this.resetStateAndScrollPosition);
  }

  getDate(backup: Backup): string {
    return new Date(backup.timestamp).toLocaleString();
  }

  getBackupName(backup: Backup): string {
    if (backup.name) {
      return backup.name;
    } else {
      return '<' + this.localizationService.translate('popups.managebackups.noname') + '>';
    }
  }

  enableRenameMode(backup: Backup) {
    this.resetState();
    this.renameMode = true;
    this.setSelectedBackup(backup);
    this.renamedBackup = backup.name;
    setTimeout(() => {
      this.backupRenameInput.nativeElement.focus();
      this.backupRenameInput.nativeElement.select();
    }, 0);
  }

  enableDeleteMode(backup: Backup) {
    this.resetState();
    this.deleteMode = true;
    this.setSelectedBackup(backup);
  }

  enableRestoreMode(backup: Backup) {
    this.resetState();
    this.restoreMode = true;
    this.setSelectedBackup(backup);
  }

  deleteBackup() {
    this.backupsService.deleteBackup(this.selectedBackup).then(() => {
      this.removeFromBackups(this.selectedBackup);
      this.resetState();
    }).catch(() => {
      this.deleteMode = false;
      this.errorMode = true;
    });
  }

  restoreBackup() {
    this.backupsService.restoreBackup(this.selectedBackup).then(() => {
      this.resetState();
      this.dataRestored.emit();
    }).catch(() => {
      this.restoreMode = false;
      this.errorMode = true;
    });
  }

  renameBackup(event: any) {
    this.backupsService.renameBackup(this.selectedBackup, this.renamedBackup).then(backupWithNewName => {
      this.removeFromBackups(this.selectedBackup);
      this.addToBackups(backupWithNewName);
    }).catch(() => {
      this.renameMode = false;
      setTimeout(() => {
        this.errorMode = true;
      }, 0);
    });
    event.stopPropagation();
  }

  backupNow() {
    this.backupTaken = true;
    this.backupsService.backupNow().then(backup => {
      this.addToBackups(backup);
    }).catch(() => {
      this.errorMode = true;
    });
  }

  resetState = () => {
    this.restoreMode = false;
    this.renameMode = false;
    this.deleteMode = false;
    this.backupsSelectionMap.clear();
    this.renamedBackup = '';
    this.selectedBackup = null;
    this.backupTaken = false;
    this.errorMode = false;
  };

  private resetStateAndScrollPosition = () => {
    this.resetState();
    this.backupsTable.nativeElement.scrollTop = 0;
  };

  private setSelectedBackup(backup: Backup) {
    this.selectedBackup = backup;
    this.backupsSelectionMap.set(backup.timestamp, true);
  }

  private removeFromBackups(backup: Backup) {
    this.backups.splice(this.backups.findIndex((e) => e.timestamp === backup.timestamp), 1);
  }

  private addToBackups(backup: Backup) {
    this.backups.push(backup);
    this.backups.sort((a, b) => a.timestamp - b.timestamp);
  }
}
