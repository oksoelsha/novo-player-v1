export class GameSecondaryData {
    screenshot1: string;
    screenshot2: string;
    musicFiles: string[];
    moreScreenshots: string[];

    constructor(screenshot1: string, screenshot2: string, musicFiles: string[], moreScreenshots: string[]) {
        this.screenshot1 = screenshot1;
        this.screenshot2 = screenshot2;
        this.musicFiles = musicFiles;
        this.moreScreenshots = moreScreenshots;
    }
}
