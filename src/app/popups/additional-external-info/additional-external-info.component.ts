import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Game } from '../../models/game';
import { Settings } from '../../models/settings';
import { AdditionalExternalInfoService } from '../../services/additional-external-info.service';
import { LocalizationService } from '../../services/localization.service';
import { SettingsService } from '../../services/settings.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-additional-external-info',
  templateUrl: './additional-external-info.component.html',
  styleUrls: ['../../common-styles.sass', './additional-external-info.component.sass']
})
export class AdditionalExternalInfoComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;

  showData = false;
  error = false;
  errorMessage = '';
  matchedName = '';
  allPlatforms: string[] = [];
  boxArtImages: string[] = [];
  giantbombGamePage = '';

  private giantbombApiKey = '';

  constructor(protected changeDetector: ChangeDetectorRef, private additionalExternalInfoService: AdditionalExternalInfoService,
    private settingsService: SettingsService, private localizationService: LocalizationService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();

    this.settingsService.getSettings().then((settings: Settings) => {
      this.giantbombApiKey = settings.giantbombApiKey;
    });
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    this.additionalExternalInfoService.getAdditionalExternalInfo(this.game, this.giantbombApiKey)
      .then((data: any) => {
        this.showData = true;
        if (data.response.error === 'OK') {
        const dataForMSX = this.getResultWithMSXPlatform(data.searchString, data.response.results);
        if (dataForMSX) {
          const platforms: string[] = [];
          for (let ix = 0; ix < dataForMSX.platforms.length; ix++) {
            platforms.push(dataForMSX.platforms[ix].name);
          }
          this.matchedName = dataForMSX.name;
          this.allPlatforms = platforms;
          this.getBoxArtImages(dataForMSX);
          this.giantbombGamePage = dataForMSX.site_detail_url;
        } else {
          this.matchedName = this.localizationService.translate('giantbomb.notfound');
        }
      } else {
        this.error = true;
        this.errorMessage = data.response.error;
      }
    }).catch(error => {
      this.showData = true;
      this.error = true;
      this.errorMessage = this.localizationService.translate('giantbomb.failedtoconnect');
    });
    super.open();
  }

  close(): void {
    super.close(() => {
      this.showData = false;
      this.matchedName = '';
      this.allPlatforms = [];
      this.boxArtImages = [];
      this.error = false;
      this.errorMessage = '';
    });
  }

  private getBoxArtImages(dataForMSX: any) {
    for (let ix = 0; ix < dataForMSX.image_tags.length; ix++) {
      if (dataForMSX.image_tags[ix].name === 'Box Art') {
        this.additionalExternalInfoService.getBoxArtImages(dataForMSX.image_tags[ix].api_detail_url, this.giantbombApiKey).then((images: any[]) => {
          const temp: string[] = [];
          images.forEach(image => {
            temp.push(image.original_url);
          });
          this.boxArtImages = temp;
        });
      }
    }
  }

  private getResultWithMSXPlatform(searchString: string, data: any[]): any {
    for (let ix = 0; ix < data.length; ix++) {
      if (searchString.toLowerCase() === data[ix].name.toLowerCase()) {
        for (let iy = 0; iy < data[ix].platforms.length; iy++) {
          if (data[ix].platforms[iy].name === 'MSX') {
            return data[ix];
          }
        }
      }
    }
    return null;
  }
}
