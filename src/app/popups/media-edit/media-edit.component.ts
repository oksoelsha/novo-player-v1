import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from '../../models/game';
import { EmulatorService } from '../../services/emulator.service';
import { PopupComponent } from '../popup.component';

@Component({
  selector: 'app-media-edit',
  templateUrl: './media-edit.component.html',
  styleUrls: ['./media-edit.component.sass']
})
export class MediaEditComponent extends PopupComponent implements OnInit, AfterViewInit {

  @Input() popupId!: string;
  @Input() game!: Game;
  @Output() updatedGame: EventEmitter<Game> = new EventEmitter<Game>();

  romA: string | undefined;
  romB: string | undefined;
  extensionRom: string | undefined;
  extensionRom2: string | undefined;
  diskA: string | undefined;
  diskB: string | undefined;
  tape: string | undefined;
  harddisk: string | undefined;
  laserdisc: string | undefined;

  extensions: string[] = [];

  constructor(protected changeDetector: ChangeDetectorRef, private emulatorService: EmulatorService) {
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

    this.romA = this.game.romA;
    this.romB = this.game.romB;
    this.extensionRom = this.game.extensionRom;
    this.extensionRom2 = this.game.extensionRom2;
    this.diskA = this.game.diskA;
    this.diskB = this.game.diskB;
    this.tape = this.game.tape;
    this.harddisk = this.game.harddisk;
    this.laserdisc = this.game.laserdisc;

    this.emulatorService.getExtensions().then((data: string[]) => {
      this.extensions = data;
    });
  }

  save() {
    const updatedGame: Game = Object.assign({}, this.game);

    updatedGame.romA = this.romA;
    updatedGame.romB = this.romB;
    updatedGame.extensionRom = this.extensionRom;
    updatedGame.extensionRom2 = this.extensionRom2;
    updatedGame.diskA = this.diskA;
    updatedGame.diskB = this.diskB;
    updatedGame.tape = this.tape;
    updatedGame.harddisk = this.harddisk;
    updatedGame.laserdisc = this.laserdisc;

    this.updatedGame.emit(updatedGame);
    this.close();
  }
}
