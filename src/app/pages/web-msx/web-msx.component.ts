import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../../models/game';
import { Settings } from '../../models/settings';
import { EmulatorService } from '../../services/emulator.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-web-msx',
  templateUrl: './web-msx.component.html',
  styleUrls: ['./web-msx.component.sass']
})
export class WebMSXComponent implements OnInit, OnDestroy {

  selectedGame: Game;
  error: boolean;
  private wmsxScript: any;

  constructor(private renderer: Renderer2, private route: ActivatedRoute, private settingsService: SettingsService,
    private emulatorService: EmulatorService, private router: Router) {
    this.selectedGame = JSON.parse(route.snapshot.paramMap.get('gameParams'));
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
}
