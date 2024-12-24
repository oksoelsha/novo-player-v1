import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EmuliciousUtils } from '../../models/emulicious-utils';
import { Game } from '../../models/game';
import { LocalizationService } from '../../services/localization.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-emulicious-arguments-edit',
  templateUrl: './emulicious-arguments-edit.component.html',
  styleUrls: ['./emulicious-arguments-edit.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmuliciousArgumentsEditComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId: string;
  @Input() game: Game;
  @Output() emuliciousData: EventEmitter<any> = new EventEmitter<any>();

  emuliciousArguments: string;
  emuliciousOverrideSettings: boolean;

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

    this.emuliciousArguments = this.game.emuliciousArguments;
    this.emuliciousOverrideSettings = this.game.emuliciousOverrideSettings;
  }

  getEmuliciousArgumentsMap(): Map<string, string[]> {
    return EmuliciousUtils.getCommandLineArgumentsMap();
  }

  save() {
    this.emuliciousData.emit({emuliciousArguments: this.emuliciousArguments, emuliciousOverrideSettings: this.emuliciousOverrideSettings});
    this.close();
  }
}
