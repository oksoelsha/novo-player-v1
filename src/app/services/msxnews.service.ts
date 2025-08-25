import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';
import { NewsCollection, NewsItem } from '../models/news-collection';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class MsxnewsService {

  private readonly feedCheckPeriod = 10*60*1000; //10 minutes
  private ipc: IpcRenderer;
  private subject = new Subject<void>();
  private news: NewsItem[] = [];
  private newNews = false;
  private checkFrequency: any;

  constructor(private settingsService: SettingsService) {
    this.ipc = window.require('electron').ipcRenderer;

    settingsService.getSettings().then(settings => {
      if (settings.enableNews) {
        this.setCheckInterval();
      }
    });

    settingsService.getUpdatedSettings().subscribe(settings => {
      this.stopCheck();
      if (settings.enableNews) {
        this.setCheckInterval();
      }
    });
  }

  getNewsNotification(): Observable<void> {
    return this.subject.asObservable();
  }

  getNews(): NewsItem[] {
    return this.news;
  }

  getNewNewsStatus() {
    return this.newNews;
  }

  resetNewNewsStatus() {
    this.newNews = false;
  }

  private setCheckInterval() {
    this.checkNews();
    this.checkFrequency = setInterval(() => {
      this.checkNews();
    }, this.feedCheckPeriod);
  }

  private stopCheck() {
    if (this.checkFrequency) {
      clearInterval(this.checkFrequency);
    }
  }

  private checkNews() {
    this.ipc.once('getNewsResponse', (event, newsCollection: NewsCollection) => {
      this.news = newsCollection.news;
      if (newsCollection.updated) {
        this.newNews = true;
      }
      this.subject.next();
    });
    this.ipc.send('getNews');
  }
}
