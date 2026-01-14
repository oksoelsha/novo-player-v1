export class ScreenshotsUtils {

    static screenshotsData: any[] = [];

    static registerScreenshotsData(extraDataInfo: Map<string, string>, screenshotsField: string) {
        ScreenshotsUtils.screenshotsData.push({extraDataInfo, screenshotsField});
    }

    static getScreenshotsData(): any[] {
        return ScreenshotsUtils.screenshotsData;
    }
}
