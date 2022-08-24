import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  public static readonly Languages = [
    'en-US',
    'ca-ES',
    'nl-NL',
    'fr-FR',
    'it-IT',
    'ja-JP',
    'pt-BR',
    'ru-RU',
    'es-ES'
  ];
  private languageSetSubject = new Subject<any>();

  constructor(private translateService: TranslateService) { }

  async useLanguage(language: string): Promise<void> {
    const sanitizedLanguage = this.santizeLanguageToUse(language);
    this.translateService.setDefaultLang(sanitizedLanguage);
    return firstValueFrom(this.translateService.use(sanitizedLanguage)).then(() => {
      this.languageSetSubject.next(true);
    });
  }

  translate(key: string | string[], interpolateParams?: object): string {
    return this.translateService.instant(key, interpolateParams) as string;
  }

  getLanguageSetEvent(): Observable<void> {
    return this.languageSetSubject.asObservable();
  }

  private santizeLanguageToUse(language: string): string {
    if (LocalizationService.Languages.indexOf(language) > -1) {
      return language;
    } else {
      return 'en-US';
    }
  }
}
