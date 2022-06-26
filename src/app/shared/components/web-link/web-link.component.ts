import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GamesService } from '../../../services/games.service';

@Component({
  selector: 'app-web-link',
  templateUrl: './web-link.component.html',
  styleUrls: ['./web-link.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebLinkComponent {

  @Input() address: string;
  @Input() buttonLook: boolean;
  @Input() label: string;

  constructor(private gamesService: GamesService) { }

  openInBrowser() {
    this.gamesService.openExternally(this.address);
  }
}
