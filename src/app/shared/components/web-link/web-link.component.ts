import { Component, Input } from '@angular/core';
import { GamesService } from '../../../services/games.service';

@Component({
  selector: 'app-web-link',
  templateUrl: './web-link.component.html',
  styleUrls: ['./web-link.component.sass']
})
export class WebLinkComponent {

  @Input() address: string;
  @Input() label: string;

  constructor(private gamesService: GamesService) { }

  openInBrowser() {
    this.gamesService.openExternally(this.address);
  }
}
