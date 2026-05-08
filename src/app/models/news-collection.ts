export class NewsCollection {
    updated: boolean;
    news: NewsItem[];

    constructor(updated: boolean, news: NewsItem[]) {
        this.updated = updated;
        this.news = news;
    }
}

export class NewsItem {
    readonly title: string | undefined;
    readonly link: string | undefined;
    readonly pubDate: number;
    readonly feedSiteName: string;
    readonly feedSiteUrl: string;

    constructor(title: string | undefined, link: string | undefined, pubDate: number, feedSiteName: string, feedSiteUrl: string) {
        this.title = title;
        this.link = link;
        this.pubDate = pubDate;
        this.feedSiteName = feedSiteName;
        this.feedSiteUrl = feedSiteUrl;
    }
}
