import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { Settings } from '../../models/settings';
import { LocalizationService } from '../../services/localization.service';
import { AlertsService } from '../../shared/components/alerts/alerts.service';
import { GamesService } from '../../services/games.service';
import { DeactivateComponent } from '../../guards/deactivate-guard.service';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../../common-styles.sass', './settings.component.sass']
})
export class SettingsComponent implements OnInit, AfterViewInit, DeactivateComponent {
  @ViewChild('settingsForm', { static: true }) settingsForm: NgForm;

  readonly isWindows = this.platformService.isOnWindows();
  openmsxPath = '';
  screenshotsPath = '';
  gameMusicPath = '';
  defaultListing = '';
  webmsxPath = '';
  bluemsxPath = '';
  bluemsxParams = '';
  submitDisabled = true;
  listings: string[] = [];
  language = '';
  languages: string[] = [];
  languageReverseMap: Map<string, string>;
  languageIcons: string[] = [];

  constructor(private settingsService: SettingsService, private alertService: AlertsService, private gamesService: GamesService,
    private localizationService: LocalizationService, private platformService: PlatformService) { }

  ngOnInit() {
    this.gamesService.getListings().then((data: string[]) => this.listings = data);
    this.setLanguages();
    this.setLanguageIcons();
    const self = this;
    this.settingsService.getSettings().then((settings: Settings) => {
      self.openmsxPath = settings.openmsxPath;
      self.screenshotsPath = settings.screenshotsPath;
      self.gameMusicPath = settings.gameMusicPath;
      self.defaultListing = settings.defaultListing;
      self.webmsxPath = settings.webmsxPath;
      self.bluemsxPath = settings.bluemsxPath;
      self.bluemsxParams = settings.bluemsxParams;
      self.setSelectedLanguage(settings);
    });
  }

  ngAfterViewInit() {
    this.settingsForm.statusChanges.subscribe(() => {
      this.submitDisabled = !this.settingsForm.dirty;
    });
  }

  canExit(): boolean {
    return this.submitDisabled;
  }

  updateControl(control: string, value: any) {
    if (this.settingsForm.controls[control].value !== value) {
      this.settingsForm.controls[control].setValue(value);
      this.submitDisabled = false;
    }
  }

  updateField(field: string, value: any) {
    if (value !== this[field]) {
      this[field] = value;
      this.submitDisabled = false;
    }
  }

  submitSettings(form: any) {
    const settings = new Settings(form.value['openmsx-path'], form.value['screenshots-path'], form.value['game-music-path'],
      this.defaultListing, form.value['webmsx-path'], form.value['bluemsx-path'], form.value['bluemsx-params'],
      this.languageReverseMap.get(this.language));
    this.settingsService.saveSettings(settings);
    this.localizationService.useLanguage(this.languageReverseMap.get(this.language)).then(() => {
      this.setSelectedLanguage(settings);
      this.setLanguages();
      this.alertService.success(this.localizationService.translate('settings.settingssavedsuccessfully'));
    });
    this.submitDisabled = true;
  }

  private setLanguages() {
    this.languages = [];
    this.languageReverseMap = new Map();

    for (const language of LocalizationService.Languages) {
      const translatedLanguageCode = this.getLanguageDisplayName(language);
      this.languageReverseMap.set(translatedLanguageCode, language);
      this.languages.push(translatedLanguageCode);
    }
  }

  private setLanguageIcons() {
    this.languageIcons.push('assets/images/flags/en_US.png');
    this.languageIcons.push('assets/images/flags/ca_ES.png');
    this.languageIcons.push('assets/images/flags/nl_NL.png');
    this.languageIcons.push('assets/images/flags/fr_FR.png');
    this.languageIcons.push('assets/images/flags/it_IT.png');
    this.languageIcons.push('assets/images/flags/ja_JP.png');
    this.languageIcons.push('assets/images/flags/pt_BR.png');
    this.languageIcons.push('assets/images/flags/ru_RU.png');
    this.languageIcons.push('assets/images/flags/es_ES.png');
  }

  private getLanguageDisplayName(language: string) {
    return this.localizationService.translate('language.' + language);
  }

  private setSelectedLanguage(settings: Settings) {
    if (settings.language) {
      this.language = this.getLanguageDisplayName(settings.language);
    } else {
      this.language = this.getLanguageDisplayName('en-US');
    }
  }
}
