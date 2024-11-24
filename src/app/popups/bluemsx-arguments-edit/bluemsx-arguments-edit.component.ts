import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BlueMSXUtils } from '../../models/bluemsx-utils';
import { Game } from '../../models/game';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-bluemsx-arguments-edit',
  templateUrl: './bluemsx-arguments-edit.component.html',
  styleUrls: ['./bluemsx-arguments-edit.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BluemsxArgumentsEditComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @Output() bluemsxData: EventEmitter<any> = new EventEmitter<any>();

  bluemsxArguments: string;
  bluemsxOverrideSettings: boolean;

  constructor(protected changeDetector: ChangeDetectorRef, private localizationService: LocalizationService) {
    super(changeDetector);
  }

  ngOnInit() {
    super.commonInit();
  }

  ngAfterViewInit(): void {
    super.commonViewInit();
  }

  open(): void {
    super.reattach();
    super.open();

    this.bluemsxArguments = this.game.bluemsxArguments;
    this.bluemsxOverrideSettings = this.game.bluemsxOverrideSettings;
  }

  getBlueMSXArgumentsMap(): Map<string, string[]> {
    return BlueMSXUtils.getCommandLineArgumentsMap();
  }

  save() {
    this.bluemsxData.emit({bluemsxArguments: this.bluemsxArguments, bluemsxOverrideSettings: this.bluemsxOverrideSettings});
    this.close();
  }
}
