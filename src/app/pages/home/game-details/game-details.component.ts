import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Game } from '../../../models/game';
import { GameUtils } from '../../../models/game-utils';
import { GamesService } from '../../../services/games.service';
import { LocalizationService } from '../../../services/localization.service';
import { FilesService } from '../../../services/files.service';

@Component({
  selector: 'app-home-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameDetailsComponent implements OnChanges {

  @Input() selectedGame: Game;
  @ViewChild('gameDetailSimpleText', { static: true }) private gameDetailSimpleText: TemplateRef<object>;
  @ViewChild('gameDetailSimpleTextWithCopy', { static: true }) private gameDetailSimpleTextWithCopy: TemplateRef<object>;
  @ViewChild('gameDetailFiles', { static: true }) private gameDetailFiles: TemplateRef<object>;
  @ViewChild('gameDetailMedium', { static: true }) private gameDetailMedium: TemplateRef<object>;
  @ViewChild('gameDetailSize', { static: true }) private gameDetailSize: TemplateRef<object>;
  @ViewChild('gameDetailCountry', { static: true }) private gameDetailCountry: TemplateRef<object>;
  @ViewChild('gameDetailGenerations', { static: true }) private gameDetailGenerations: TemplateRef<object>;
  @ViewChild('gameDetailSounds', { static: true }) private gameDetailSounds: TemplateRef<object>;
  @ViewChild('gameDetailGenres', { static: true }) private gameDetailGenres: TemplateRef<object>;
  @ViewChild('gameDetailGenerationMSXLink', { static: true }) private gameDetailGenerationMSXLink: TemplateRef<object>;
  @ViewChild('gameDetailInfoFile', { static: true }) private gameDetailInfoFile: TemplateRef<object>;

  selectedGameMedium: string;
  selectedMediumGroupTotal: string;

  readonly countryFlags: Map<string, string> = new Map([
    ['BR', 'pt_BR'],
    ['DE', 'de_DE'],
    ['ES', 'es_ES'],
    ['FR', 'fr_FR'],
    ['GB', 'UK'],
    ['HK', 'HK'],
    ['IT', 'it_IT'],
    ['JP', 'ja_JP'],
    ['KR', 'ko_KR'],
    ['KW', 'KW'],
    ['NL', 'nl_NL'],
    ['PT', 'PT'],
    ['RU', 'ru_RU'],
    ['SA', 'SA'],
    ['SE', 'sv_SE'],
    ['UK', 'UK'],
    ['US', 'en_US'],
    ['TW', 'zh_TW'],
    ['CA', 'CA'],
    ['EU', 'EU']
  ]);

  private readonly gameDetails = [
    { name: this.localizationService.translate('home.commonname'), value: 'title', blockName: 'gameDetailSimpleText' },
    { name: this.localizationService.translate('home.files'), blockName: 'gameDetailFiles' },
    { name: this.localizationService.translate('home.medium'), blockName: 'gameDetailMedium' },
    { name: this.localizationService.translate('home.system'), value: 'system', blockName: 'gameDetailSimpleText' },
    { name: this.localizationService.translate('home.company'), value: 'company', blockName: 'gameDetailSimpleText' },
    { name: this.localizationService.translate('home.year'), value: 'year', blockName: 'gameDetailSimpleText' },
    { name: this.localizationService.translate('home.country'), value: 'country', blockName: 'gameDetailCountry' },
    { name: 'SHA1', value: 'sha1Code', blockName: 'gameDetailSimpleTextWithCopy' },
    { name: this.localizationService.translate('home.size'), value: 'size', blockName: 'gameDetailSize' },
    { name: this.localizationService.translate('home.generations'), value: 'generations', blockName: 'gameDetailGenerations' },
    { name: this.localizationService.translate('home.sound'), value: 'sounds', blockName: 'gameDetailSounds' },
    { name: this.localizationService.translate('home.genres'), value: 'genre1', blockName: 'gameDetailGenres' },
    { name: this.localizationService.translate('home.dump'), value: 'dump', blockName: 'gameDetailSimpleText' },
    { name: this.localizationService.translate('home.mapper'), value: 'mapper', blockName: 'gameDetailSimpleText' },
    { name: this.localizationService.translate('home.start'), value: 'start', blockName: 'gameDetailSimpleText' },
    { name: this.localizationService.translate('home.remark'), value: 'remark', blockName: 'gameDetailSimpleText' },
    { name: 'Generation-MSX', value: 'generationMSXId', blockName: 'gameDetailGenerationMSXLink' },
    { name: this.localizationService.translate('home.infoFile'), value: 'infoFile', blockName: 'gameDetailInfoFile' },
  ];
  private readonly fileFields: string[] = ['romA', 'romB', 'diskA', 'diskB', 'tape', 'harddisk', 'laserdisc'];

  constructor(private gamesService: GamesService, private localizationService: LocalizationService, private clipboard: Clipboard,
    private filesService: FilesService, private changeDetector: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedGame.isFirstChange() ||
      changes.selectedGame.currentValue.sha1Code !== changes.selectedGame.previousValue.sha1Code) {
      this.setSelectedGameMedium();
    }
  }

  getFilteredGameDetails() {
    return this.gameDetails.filter(d => !d.value ||
      (this.selectedGame[d.value] && this.selectedGame[d.value] !== '' && this.selectedGame[d.value] !== 0));
  }

  getSelectedGameFiles(): string[] {
    const files: string[] = [];
    for (const fileField of this.fileFields) {
      if (this.selectedGame[fileField] != null) {
        files.push(this.selectedGame[fileField]);
      }
    }
    return files;
  }

  exploreFile(file: string) {
    this.gamesService.exploreFile(file);
  }

  getSizeDisplayString(): string {
    return Math.floor(this.selectedGame.size / 1024) + ' KB';
  }

  isGenerationMSX(): boolean {
    return GameUtils.isMSX(this.selectedGame);
  }

  isGenerationMSX2(): boolean {
    return GameUtils.isMSX2(this.selectedGame);
  }

  isGenerationMSX2Plus(): boolean {
    return GameUtils.isMSX2Plus(this.selectedGame);
  }

  isGenerationTurboR(): boolean {
    return GameUtils.isTurboR(this.selectedGame);
  }

  getSoundsDisplayString(): string {
    const displayString: string[] = [];

    if (GameUtils.isPSG(this.selectedGame)) {
      displayString.push('PSG');
    }
    if (GameUtils.isSCC(this.selectedGame)) {
      displayString.push('SCC');
    }
    if (GameUtils.isSCCI(this.selectedGame)) {
      displayString.push('SCC-I');
    }
    if (GameUtils.isPCM(this.selectedGame)) {
      displayString.push('PCM');
    }
    if (GameUtils.isMSXMusic(this.selectedGame)) {
      displayString.push('MSX-MUSIC');
    }
    if (GameUtils.isMSXAudio(this.selectedGame)) {
      displayString.push('MSX-AUDIO');
    }
    if (GameUtils.isMoonsound(this.selectedGame)) {
      displayString.push('Moonsound');
    }
    if (GameUtils.isMidi(this.selectedGame)) {
      displayString.push('MIDI');
    }

    return displayString.join(', ');
  }

  getGenresDisplayString(): string {
    let displayString: string = GameUtils.getGenre(this.selectedGame.genre1);
    if (displayString != null) {
      const genre2 = GameUtils.getGenre(this.selectedGame.genre2);
      if (genre2 != null) {
        displayString += ', ' + genre2;
      }
    }
    return displayString;
  }

  isDisplayGenerationMSX() {
    return this.selectedGame.generationMSXId < 10000;
  }

  getGenerationMSXAddress() {
    return GameUtils.getGenerationMSXURLForGame(this.selectedGame.generationMSXId);
  }

  copy(text: string) {
    this.clipboard.copy(text);
  }

  openInfoFile() {
    this.gamesService.openExternally(this.selectedGame.infoFile);
  }

  private setSelectedGameMedium() {
    if (this.selectedGame.romA != null) {
      this.selectedGameMedium = this.localizationService.translate('medium.rom');
      this.selectedMediumGroupTotal = '';
    } else if (this.selectedGame.diskA != null) {
      this.selectedGameMedium = this.localizationService.translate('medium.disk');
      this.selectedMediumGroupTotal = '';
      this.setSelectedMediumGroupTotal(this.selectedGame.diskA);
    } else if (this.selectedGame.tape != null) {
      this.selectedGameMedium = this.localizationService.translate('medium.tape');
      this.selectedMediumGroupTotal = '';
      this.setSelectedMediumGroupTotal(this.selectedGame.tape);
    } else if (this.selectedGame.harddisk != null) {
      this.selectedGameMedium = this.localizationService.translate('medium.harddisk');
      this.selectedMediumGroupTotal = '';
    } else if (this.selectedGame.laserdisc != null) {
      this.selectedGameMedium = this.localizationService.translate('medium.laserdisc');
      this.selectedMediumGroupTotal = '';
    } else {
      // shouldn't happen
      this.selectedGameMedium = '';
      this.selectedMediumGroupTotal = '';
    }
    this.changeDetector.markForCheck();
  }

  private setSelectedMediumGroupTotal(medium: string) {
    this.filesService.getFileGroup(Number(this.selectedGame.sha1Code), medium).then((group: string[]) => {
      if (group.length > 1) {
        this.selectedMediumGroupTotal = group.length + 'x';
        this.changeDetector.detectChanges();
      }
    });
  }
}
