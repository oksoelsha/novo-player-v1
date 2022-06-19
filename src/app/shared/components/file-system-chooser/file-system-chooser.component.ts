import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FileTypeUtils } from '../../../../../app/utils/FileTypeUtils';
import { FilesService } from '../../../services/files.service';

@Component({
  selector: 'app-file-system-chooser',
  templateUrl: './file-system-chooser.component.html',
  styleUrls: ['./file-system-chooser.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileSystemChooserComponent {

  private static extensionsMap: Map<string, any> = new Map([
    ['ROM', { name: 'ROM Images', extensions: FileTypeUtils.getRomExtensions().concat(FileTypeUtils.getZipExtensions())}],
    ['Disk', { name: 'Disk Images', extensions: FileTypeUtils.getDiskExtensions().concat(FileTypeUtils.getZipExtensions())}],
    ['Tape', { name: 'Tape Images', extensions: FileTypeUtils.getTapeExtensions().concat(FileTypeUtils.getZipExtensions())}],
    ['Harddisk', { name: 'Harddisk Images', extensions: FileTypeUtils.getHarddiskExtensions().concat(FileTypeUtils.getZipExtensions())}],
    ['Laserdisc', { name: 'Laserdisc Images', extensions: FileTypeUtils.getLaserdiscExtensions().concat(FileTypeUtils.getZipExtensions())}]
  ]);

  @Input() directoryMode: boolean;
  @Input() label: string;
  @Input() filtersType: string;
  @Input() multiSelections: boolean;
  @Input() useIcon: boolean = false;  
  @Output() chosen: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fileService: FilesService) { }

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
      filters = [
        FileSystemChooserComponent.extensionsMap.get(this.filtersType)
      ];
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
