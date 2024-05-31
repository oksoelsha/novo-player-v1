export class Utils {
    private static maxTitleLength = 70;

    static compressStringIfTooLong(str: string): string {
        if (str?.length > this.maxTitleLength) {
            return str.substring(0, this.maxTitleLength - 4) + '...' + str.substring(str.length - 4);
        } else {
            return str;
        }
    }
}
