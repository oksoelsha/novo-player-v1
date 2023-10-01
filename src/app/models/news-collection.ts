export class NewsCollection {
    updated: boolean;
    news: NewsItem[];

    constructor(updated: boolean, news: NewsItem[]) {
        this.updated = updated;
        this.news = news;
    }
}

export class NewsItem {
    title: string;
    link: string;
    pubDate: number;
    feedSiteName: string;
    feedSiteUrl: string;

    constructor(title: string, link: string, pubDate: number, feedSiteName: string, feedSiteUrl: string) {
        this.title = title;
        this.link = link;
        this.pubDate = pubDate;
        this.feedSiteName = feedSiteName;
        this.feedSiteUrl = feedSiteUrl;
    }
}
