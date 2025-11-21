import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FileHunterService } from '../../../services/file-hunter.service';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-file-hunter',
  templateUrl: './file-hunter.component.html',
  styleUrls: ['./file-hunter.component.sass']
})
export class FileHunterComponent implements OnInit {

  @Output() gameLink: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('pagination') paginationComponent: PaginationComponent;
  @ViewChild('fileHunterDropdown', { static: true }) private fileHunterDropdown: NgbDropdown;

  fileNodes: any[] = [];
  currentFolder = '';
  currentFullPath = '';
  total = 0;
  filter = '';
  readonly pageSize = 15;

  constructor(private fileHunterService: FileHunterService) { }

  ngOnInit(): void {
    this.currentFolder = sessionStorage.getItem('fileHunterCurrentFolder');
    if (!this.currentFolder) {
      this.currentFolder = '';
    }
    this.currentFullPath = sessionStorage.getItem('fileHunterCurrentFullPath');
    this.getList(this.currentFolder, 0);
  }

  onSelectFileNode(fileNode: any) {
    const fullpath = fileNode.parent + '\\' + fileNode.name;
    if (fileNode.isFolder) {
      this.currentFolder = fullpath;
      sessionStorage.setItem('fileHunterCurrentFolder', this.currentFolder);
      this.filter = '';
      this.paginationComponent.reset();
      this.getList(this.currentFolder, 0);
    } else {
      this.getGameLink(fullpath);
      this.fileHunterDropdown.close();
    }
  }

  onSelectGoUp() {
    this.paginationComponent.reset();
    this.currentFolder = this.currentFolder.substring(0, this.currentFolder.lastIndexOf('\\'));
    sessionStorage.setItem('fileHunterCurrentFolder', this.currentFolder);
    this.getList(this.currentFolder, 0);
    this.filter = '';
  }

  getList(folder: string, page: number) {
    this.fileHunterService.getList(folder, this.pageSize, page, this.filter).then((data: any) => {
      this.fileNodes = data.contents;
      this.total = data.total;
      this.currentFullPath = data.path;
      sessionStorage.setItem('fileHunterCurrentFullPath', this.currentFullPath);
    });
  }

  actOnFilter(folder: string, page: number) {
    this.paginationComponent.reset();
    this.getList(folder, page);
  }

  private getGameLink(filename: string) {
    this.fileHunterService.getGameLink(filename).then((link: string) => {
      this.gameLink.emit(link);
    });
  }
}
