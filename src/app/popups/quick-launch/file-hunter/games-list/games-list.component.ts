import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FileHunterService } from '../../../../services/file-hunter.service';

@Component({
  selector: 'app-file-hunter-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.sass']
})
export class GamesListComponent implements OnInit {

  @Output() gameLink: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('pagination') paginationComponent!: PaginationComponent;

  readonly pageSize = 15;
  fileNodes: any[] = [];
  currentFullPath: string | null = '';
  currentFolder: string | null = '';
  total = 0;
  filter = '';

  constructor(private fileHunterService: FileHunterService) { }

  ngOnInit(): void {
    this.currentFolder = sessionStorage.getItem('fileHunterCurrentFolder');
    if (!this.currentFolder) {
      this.currentFolder = '';
    }
    this.currentFullPath = sessionStorage.getItem('fileHunterCurrentFullPath');
    this.getList(this.currentFolder, 0);
  }

  actOnFilter(folder: string, page: number) {
    this.paginationComponent.reset();
    this.getList(folder, page);
  }

  onSelectFileNode(fileNode: any) {
    let fullpath: string;
    if (fileNode.parent !== undefined) {
      fullpath = fileNode.parent + '\\' + fileNode.name;
    } else {
      fullpath = '\\' + fileNode.name;
    }
    if (fileNode.isFolder) {
      this.currentFolder = fullpath;
      sessionStorage.setItem('fileHunterCurrentFolder', this.currentFolder);
      this.filter = '';
      this.paginationComponent.reset();
      this.getList(this.currentFolder, 0);
    } else {
      this.getGameLink(fullpath);
    }
  }

  getList(folder: string, page: number) {
    this.fileHunterService.getList(folder, this.pageSize, page, this.filter).then((data: any) => {
      this.fileNodes = data.contents;
      this.total = data.total;
      this.currentFullPath = data.path;
      sessionStorage.setItem('fileHunterCurrentFullPath', this.currentFullPath!);
    });
  }

  onSelectGoUp() {
    this.paginationComponent.reset();
    this.currentFolder = this.currentFolder!.substring(0, this.currentFolder!.lastIndexOf('\\'));
    sessionStorage.setItem('fileHunterCurrentFolder', this.currentFolder);
    this.getList(this.currentFolder, 0);
    this.filter = '';
  }

  private getGameLink(filename: string) {
    this.fileHunterService.getGameLink(filename).then((link: string) => {
      this.gameLink.emit(link);
    });
  }
}
