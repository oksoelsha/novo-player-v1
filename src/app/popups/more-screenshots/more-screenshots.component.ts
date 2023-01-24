import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Game } from '../../models/game';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-more-screenshots',
  templateUrl: './more-screenshots.component.html',
  styleUrls: ['./more-screenshots.component.sass']
})
export class MoreScreenshotsComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @Input() imageFiles: string[];
  @ViewChildren('imageBlock') private imageBlocks: QueryList<ElementRef>;

  imageIndex: number;

  constructor(protected changeDetector: ChangeDetectorRef) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  async open(): Promise<void> {
    this.imageIndex = 0;
    this.showImage();
    super.open();
  }

  close(): void {
    super.close(() => {
      this.imageIndex = 0;
    });
  }

  next() {
    this.imageIndex++;
    this.showImage();
  }

  previous() {
    this.imageIndex--;
    this.showImage();
  }

  private showImage() {
    if (this.imageIndex === -1) {
      this.imageIndex = this.imageFiles.length - 1;
    } else if (this.imageIndex === this.imageFiles.length) {
      this.imageIndex = 0;
    }

    let imageBlocksArray: ElementRef[];
    setTimeout(() => {
      imageBlocksArray = this.imageBlocks.toArray();
      for (let ix = 0; ix < imageBlocksArray.length; ix++) {
        imageBlocksArray[ix].nativeElement.style.display = 'none';
      }
    }, 0);
    
    setTimeout(() => {
      imageBlocksArray[this.imageIndex].nativeElement.style.display = 'block';
    }, 0);
  }
}
