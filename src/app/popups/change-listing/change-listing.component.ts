import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from '../../models/game';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-change-listing',
  templateUrl: './change-listing.component.html',
  styleUrls: ['./change-listing.component.sass']
})
export class ChangeListingComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @Input() listings: string[];
  @Output() newListing: EventEmitter<string> = new EventEmitter<string>();

  destinationListings: string[] = [];
  selectedListing = '';

  constructor(protected changeDetector: ChangeDetectorRef) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  open(): void {
    super.open();

    this.destinationListings  = Object.assign([], this.listings);
    this.destinationListings.splice(this.destinationListings.indexOf(this.game.listing), 1);
  }

  close(): void {
    super.close(() => {
      this.selectedListing = '';
    });
  }

  move() {
    this.newListing.emit(this.selectedListing);

    this.close();
  }
}
