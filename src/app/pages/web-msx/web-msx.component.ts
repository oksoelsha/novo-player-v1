import { Component, HostListener, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../../models/game';
import { Settings } from '../../models/settings';
import { EmulatorService } from '../../services/emulator.service';
import { SettingsService } from '../../services/settings.service';
import { WindowService } from '../../services/window.service';
import { GamePassword, GamePasswordsInfo } from '../../models/game-passwords-info';
import { GamesService } from '../../services/games.service';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-web-msx',
  templateUrl: './web-msx.component.html',
  styleUrls: ['../../common-styles.sass', './web-msx.component.sass']
})
export class WebMSXComponent implements OnInit, OnDestroy {

  @ViewChildren('passwordsDropdown') private passwordsDropdown: QueryList<NgbDropdown>;
  selectedGame: Game;
  error: boolean;
  gamePasswordsInfo: GamePasswordsInfo;
  selectedPassword: GamePassword;
  private wmsxScript: any;
  private msxKeyCodeByCharacter = new Map<string, number>();

  constructor(private renderer: Renderer2, private route: ActivatedRoute, private settingsService: SettingsService,
    private emulatorService: EmulatorService, private router: Router, private windowService: WindowService,
    private gamesService: GamesService) {
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
          this.startWebmsx();
        }
      });
    });
    this.setPasswords();
    this.initializeKeysMap();
  }

  loadWebMSX(fullpath: string) {
    this.wmsxScript = this.renderer.createElement('script');
    this.wmsxScript.src = fullpath;
    this.renderer.appendChild(document.body, this.wmsxScript);
  }

  startWebmsx() {
    const doneLoadingWMSXCheckInterval = setInterval(() => {
      if (typeof window['WMSX'] !== 'undefined' && typeof window['WMSX'].start !== 'undefined') {
        clearInterval(doneLoadingWMSXCheckInterval);
        window['WMSX'].start();
      }
    }, 20);
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

  async enterPassword() {
//    window['WMSX'].room.keyboard.typeString('A');
    const passwordsDropdownArray = this.passwordsDropdown.toArray();
    if (passwordsDropdownArray.length === 1) {
      passwordsDropdownArray[0].close();
    }
    const password = this.selectedPassword.password;
    for (let i = 0; i < password.length; i++) {
      if (password[i] === ' ') {
        await this.pressKey(this.msxKeyCodeByCharacter.get('Space'));
      } else {
        await this.pressKey(this.msxKeyCodeByCharacter.get(password[i]));
      }
    }
    if (this.selectedPassword.pressReturn) {
      await this.pressKey(this.msxKeyCodeByCharacter.get('Enter'));
    }
  }

  private initializeKeysMap() {
    this.msxKeyCodeByCharacter.set('1', 1);
    this.msxKeyCodeByCharacter.set('2', 2);
    this.msxKeyCodeByCharacter.set('3', 3);
    this.msxKeyCodeByCharacter.set('4', 4);
    this.msxKeyCodeByCharacter.set('5', 5);
    this.msxKeyCodeByCharacter.set('6', 6);
    this.msxKeyCodeByCharacter.set('7', 7);
    this.msxKeyCodeByCharacter.set('8', 8);
    this.msxKeyCodeByCharacter.set('9', 9);
    this.msxKeyCodeByCharacter.set('0', 10);
    this.msxKeyCodeByCharacter.set('Q', 101);
    this.msxKeyCodeByCharacter.set('W', 102);
    this.msxKeyCodeByCharacter.set('E', 103);
    this.msxKeyCodeByCharacter.set('R', 104);
    this.msxKeyCodeByCharacter.set('T', 105);
    this.msxKeyCodeByCharacter.set('Y', 106);
    this.msxKeyCodeByCharacter.set('U', 107);
    this.msxKeyCodeByCharacter.set('I', 108);
    this.msxKeyCodeByCharacter.set('O', 109);
    this.msxKeyCodeByCharacter.set('P', 110);
    this.msxKeyCodeByCharacter.set('A', 111);
    this.msxKeyCodeByCharacter.set('S', 112);
    this.msxKeyCodeByCharacter.set('D', 113);
    this.msxKeyCodeByCharacter.set('F', 114);
    this.msxKeyCodeByCharacter.set('G', 115);
    this.msxKeyCodeByCharacter.set('H', 116);
    this.msxKeyCodeByCharacter.set('J', 117);
    this.msxKeyCodeByCharacter.set('K', 118);
    this.msxKeyCodeByCharacter.set('L', 119);
    this.msxKeyCodeByCharacter.set('Z', 120);
    this.msxKeyCodeByCharacter.set('X', 121);
    this.msxKeyCodeByCharacter.set('C', 122);
    this.msxKeyCodeByCharacter.set('V', 123);
    this.msxKeyCodeByCharacter.set('B', 124);
    this.msxKeyCodeByCharacter.set('N', 125);
    this.msxKeyCodeByCharacter.set('M', 126);
    this.msxKeyCodeByCharacter.set('Enter', 204);
    this.msxKeyCodeByCharacter.set('Space', 205);
    this.msxKeyCodeByCharacter.set('-', 222);
  }

  private async pressKey(keyCode: number) {
    window['WMSX'].room.keyboard.processKey(keyCode, 1);
    await this.delay();
    window['WMSX'].room.keyboard.processKey(keyCode, 0);
    await this.delay();  
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, 80));
  };

  private setPasswords() {
    this.gamesService.getGamePasswords(this.selectedGame).then((gamePasswordsInfo) => {
      this.gamePasswordsInfo = gamePasswordsInfo;
    });
  }
}
