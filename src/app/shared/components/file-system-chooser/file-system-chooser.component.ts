import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FileTypeUtils } from '../../../../../app/utils/FileTypeUtils';
import { FilesService } from '../../../services/files.service';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-file-system-chooser',
  templateUrl: './file-system-chooser.component.html',
  styleUrls: ['./file-system-chooser.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileSystemChooserComponent {

  private static extensionsMap: Map<string, any> = new Map([
    ['ROM', { nameKey: 'filebrowser.romimages', extensions: FileTypeUtils.getRomExtensions().concat(FileTypeUtils.getZipExtensions())}],
    ['Disk', { nameKey: 'filebrowser.diskimages', extensions: FileTypeUtils.getDiskExtensions().concat(FileTypeUtils.getZipExtensions())}],
    ['Tape', { nameKey: 'filebrowser.tapeimages', extensions: FileTypeUtils.getTapeExtensions().concat(FileTypeUtils.getZipExtensions())}],
    ['Harddisk', { nameKey: 'filebrowser.harddiskimages', extensions: FileTypeUtils.getHarddiskExtensions().concat(FileTypeUtils.getZipExtensions())}],
    ['Laserdisc', { nameKey: 'filebrowser.laserdiscimages', extensions: FileTypeUtils.getLaserdiscExtensions().concat(FileTypeUtils.getZipExtensions())}]
  ]);

  @Input() directoryMode: boolean;
  @Input() label: string;
  @Input() filtersType: string;
  @Input() multiSelections: boolean;
  @Input() useIcon = false;
  @Output() chosen = new EventEmitter<any>();

  constructor(private fileService: FilesService, private localizationService: LocalizationService) { }

  browse() {
    const self = this;
    let properties: string[];

    if (this.multiSelections) {
      properties = ['multiSelections'];
    } else {
      properties = [];
    }

    if (this.directoryMode) {
      properties.push('openDirectory');
    } else {
      properties.push('openFile');
    }

    let filters: object[];
    if (this.filtersType) {
      const filterEntry = FileSystemChooserComponent.extensionsMap.get(this.filtersType);
      const filter = { name: this.localizationService.translate(filterEntry.nameKey), extensions: filterEntry.extensions };
      filters = [filter];
    } else {
      filters = [];
    }

    const options: object = { properties, filters };

    this.fileService.useFileSystemDialog(options).then((value: any) => {
      if (!value.canceled) {
        if (this.multiSelections) {
          self.chosen.emit(value.filePaths);
        } else {
          self.chosen.emit(value.filePaths[0]);
        }
      }
    });
  }
}
