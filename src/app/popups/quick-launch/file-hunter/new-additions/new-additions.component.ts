import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FileHunterService } from '../../../../services/file-hunter.service';

@Component({
  selector: 'app-file-hunter-new-additions',
  templateUrl: './new-additions.component.html',
  styleUrls: ['./new-additions.component.sass']
})
export class NewAdditionsComponent implements OnInit {

  @Output() gameLink = new EventEmitter<string>();

  readonly pageSize = 16;
  newAdditions: any[] = [];
  total = 0;
  errorMessage: string | undefined;

  constructor(private fileHunterService: FileHunterService) { }

  ngOnInit(): void {
    this.getNewAdditions(0);
  }

  getNewAdditions(page: number) {
    this.fileHunterService.getNewAdditions(this.pageSize, page).then((data: any) => {
      if (data.error) {
        this.errorMessage = data.errorMessage;
      } else {
        this.newAdditions = data.contents.map((obj: any) => ({ name: decodeURIComponent(obj.name), date: obj.date }));
        this.total = data.total;
      }
    });
  }

  onSelectGame(game: any) {
    this.fileHunterService.getGameLink('/' + game.name).then((link: string) => {
      this.gameLink.emit(link);
    });
  }
}
