import { Component, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../../models/game';
import { Settings } from '../../models/settings';
import { EmulatorService } from '../../services/emulator.service';
import { SettingsService } from '../../services/settings.service';
import { WindowService } from '../../services/window.service';
import { GamePassword, GamePasswordsInfo } from '../../models/game-passwords-info';
import { GamesService } from '../../services/games.service';
import { WebmsxService } from '../../services/webmsx.service';

@Component({
  selector: 'app-web-msx',
  templateUrl: './web-msx.component.html',
  styleUrls: ['../../common-styles.sass', './web-msx.component.sass']
})
export class WebMSXComponent implements OnInit, OnDestroy {

  selectedGame: Game;
  error: boolean;
  gamePasswordsInfo: GamePasswordsInfo;
  private wmsxScript: any;

  constructor(private renderer: Renderer2, private route: ActivatedRoute, private settingsService: SettingsService,
    private emulatorService: EmulatorService, private router: Router, private windowService: WindowService,
    private gamesService: GamesService, private webmsxService: WebmsxService) {
    this.selectedGame = JSON.parse(route.snapshot.paramMap.get('gameParams'));
  }

  @HostListener('window:keydown', ['$event'])
  keydownEvent(event: any) {
    if (!event.repeat && (event.ctrlKey || event.metaKey) && event.key === '=') {
        this.windowService.zoomIn();
    }
  }

  ngOnInit(): void {
    this.settingsService.getSettings().then((settings: Settings) => {
      this.emulatorService.getWebMSXPath(settings.webmsxPath, 'wmsx.js').then((fullpath: string) => {
        this.error = (fullpath == null);
        if (!this.error) {
          this.loadWebMSX(fullpath);
          this.webmsxService.startWebmsx();
        }
      });
    });
    this.setPasswords();
  }

  private loadWebMSX(fullpath: string) {
    this.wmsxScript = this.renderer.createElement('script');
    this.wmsxScript.src = fullpath;
    this.renderer.appendChild(document.body, this.wmsxScript);
  }

  goBack() {
    this.router.navigate(['./']);
  }

  ngOnDestroy(): void {
    if (!this.error) {
      window['WMSX'].shutdown();
      this.renderer.removeChild(document.body, this.wmsxScript);
    }
  }

  enterPassword(selectedPassword: GamePassword) {
    document.getElementById('wmsx-screen-canvas').focus();
    this.webmsxService.enterPassword(selectedPassword.password, selectedPassword.pressReturn);
  }

  private setPasswords() {
    this.gamesService.getGamePasswords(this.selectedGame).then((gamePasswordsInfo) => {
      this.gamePasswordsInfo = gamePasswordsInfo;
    });
  }
}
