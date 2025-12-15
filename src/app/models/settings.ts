export class Settings {
    openmsxPath: string;
    screenshotsPath: string;
    gameMusicPath: string;
    defaultListing: string;
    webmsxPath: string;
    bluemsxPath: string;
    bluemsxParams: string;
    language: string;
    enableNews: boolean;
    displayMode: string;
    emuliciousPath: string;
    emuliciousParams: string;
    enableFileHunterGames: boolean;

    constructor(openmsxPath: string, screenshotsPath: string, gameMusicPath: string, defaultListing: string, webmsxPath: string,
        bluemsxPath: string, bluemsxParams: string, language: string, enableNews: boolean, displayMode: string,
        emuliciousPath: string, emuliciousParams: string, enableFileHunterGames: boolean) {
        this.openmsxPath = openmsxPath;
        this.screenshotsPath = screenshotsPath;
        this.gameMusicPath = gameMusicPath;
        this.defaultListing = defaultListing;
        this.webmsxPath = webmsxPath;
        this.bluemsxPath = bluemsxPath;
        this.bluemsxParams = bluemsxParams;
        this.language = language;
        this.enableNews = enableNews;
        this.displayMode = displayMode;
        this.emuliciousPath = emuliciousPath;
        this.emuliciousParams = emuliciousParams;
        this.enableFileHunterGames = enableFileHunterGames;
    }
}

export const DisplayMode = [
    'list',
    'screenshots'
];
