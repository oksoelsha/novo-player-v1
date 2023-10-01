import { BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { NewsCollection, NewsItem } from '../src/app/models/news-collection'
import Parser from 'rss-parser';
import { PersistenceUtils } from './utils/PersistenceUtils';

export class NewsService {

    private readonly latestNewsPath = PersistenceUtils.getStoragePath();
    private readonly latestNewsFile = path.join(this.latestNewsPath, 'latest-news');
    private latestNewsDates: Map<string,Date>;
    private readonly startingDate = new Date(0);
    private readonly sites: string[][] = [
        ['http://www.msxlaunchers.info/', 'http://www.msxlaunchers.info/feed', 'MSX Launchers'],
        ['https://www.msx.org/', 'https://www.msx.org/feed/news/', 'MSX Resource Center'],
        ['https://www.msxblog.es/', 'https://www.msxblog.es/feed/', 'MSX Blog'],
        ['https://pressplayontape.nl/', 'http://pressplayontape.nl/category/homecomputers/msx/feed/', 'Press Play on Tape']
    ];

    constructor(private win: BrowserWindow) {
        this.init();
    }

    private init() {
        this.latestNewsDates = this.getSavedLatestNews();
        ipcMain.on('getNews', (event: any) => {
            this.getNews();
        });
    }

    private async getNews() {
        const news: NewsItem[] = [];
        let updatedNews = false;
        Promise.allSettled(this.sites.map(i => this.getFeedData(i))).then(results => {
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    news.push(...result.value.news);
                    if (this.latestNewsDates.get(result.value.site) < result.value.latestDate) {
                        updatedNews = true;
                        this.latestNewsDates.set(result.value.site, result.value.latestDate);
                    }
                } else {
                    console.log(result.status, result.reason);
                }
            });
            if (updatedNews) {
                this.saveLatestNews();
            }
            const truncatedNews = news.sort((a, b) => { return (a.pubDate < b.pubDate) ? 1 : -1 }).slice(0, 15);
            this.win.webContents.send('getNewsResponse', new NewsCollection(updatedNews, truncatedNews));
        });
    }

    private getFeedData(feedInfo: string[]): Promise<SiteNews> {
        let parser = new Parser();
        const news: NewsItem[] = [];
        return new Promise<SiteNews>((resolve, reject) => {
            let latestDate = this.startingDate;
            parser.parseURL(feedInfo[1]).then(feed => {
                feed.items.forEach(item => {
                    const publishDate = new Date(item.pubDate);
                    news.push(new NewsItem(item.title, item.link, publishDate.getTime(), feedInfo[2], feedInfo[0]));
                    if (publishDate > latestDate) {
                        latestDate = publishDate;
                    }
                });
                resolve(new SiteNews(feedInfo[2], news, latestDate));
            });
        });
    }

    private getSavedLatestNews(): Map<string,Date> {
        if (fs.existsSync(this.latestNewsFile)) {
            const fileData = fs.readFileSync(this.latestNewsFile);
            return new Map(JSON.parse(fileData.toString()));    
        } else {
            const initialMap = new Map();
            this.sites.forEach(site => {
                initialMap.set(site[2], this.startingDate);
            });
            return initialMap;
        }
    }

    private saveLatestNews() {
        const data = JSON.stringify(Array.from(this.latestNewsDates.entries()));
        fs.writeFileSync(this.latestNewsFile, data);
    }
}

class SiteNews {
    site: string;
    news: NewsItem[];
    latestDate: Date;

    constructor(site: string, news: NewsItem[], latestDate: Date) {
        this.site = site;
        this.news = news;
        this.latestDate = latestDate;
    }
}
