import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Game } from '../../models/game';
import { AdditionalExternalInfoService } from '../../services/additional-external-info.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-additional-external-info',
  templateUrl: './additional-external-info.component.html',
  styleUrls: ['../../common-styles.sass', './additional-external-info.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AdditionalExternalInfoComponent  extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;

  matchedName = '';
  allPlatforms: string[] = [];
  boxArtImages: string[] = [];

  constructor(protected changeDetector: ChangeDetectorRef, private additionalExternalInfoService: AdditionalExternalInfoService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    this.additionalExternalInfoService.getAdditionalExternalInfo(this.game).then((results: any) => {
      const dataForMSX = this.getResultWithMSXPlatform(results.searchString, results.data);
      if (dataForMSX) {
        const platforms: string[] = [];
        for (let ix = 0; ix < dataForMSX.platforms.length; ix++) {
          platforms.push(dataForMSX.platforms[ix].name);
        }
        this.matchedName = dataForMSX.name;
        this.allPlatforms = platforms;
        this.getBoxArtImages(dataForMSX);
      } else {
        // handle the case where there's no MSX data
        this.matchedName = 'Not Found--';
      }
      super.open();
    });
  }

  close(): void {
    super.close(() => {
      this.matchedName = '';
      this.allPlatforms = [];
      this.boxArtImages = [];
    });
  }

  private getBoxArtImages(dataForMSX: any) {
    for (let ix = 0; ix < dataForMSX.image_tags.length; ix++) {
      if (dataForMSX.image_tags[ix].name === 'Box Art') {
        this.additionalExternalInfoService.getBoxArtImages(dataForMSX.image_tags[ix].api_detail_url).then((images: any[]) => {
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
      if (searchString.toLowerCase() == data[ix].name.toLowerCase()) {
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
