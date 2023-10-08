export class VersionUtils {
    static isVersionNewer(currentVersion: string, newVersion: string): boolean {
        let answer = false;
        if (currentVersion && newVersion) {
            const currentVersionDigits = currentVersion.split('.');
            const newVersionDigits = newVersion.split('.');
            const maxLength = Math.max(currentVersionDigits.length, newVersionDigits.length);

            let done = false;
            for (let counter = 0; counter < maxLength && !done; counter++) {
                let currentVersionNumber: number;
                let newVersionNumber: number;
                if (counter < currentVersionDigits.length) {
                    currentVersionNumber = +currentVersionDigits[counter];
                } else {
                    currentVersionNumber = 0;
                }
                if (counter < newVersionDigits.length) {
                    newVersionNumber = +newVersionDigits[counter];
                } else {
                    newVersionNumber = 0;
                }
                if (newVersionNumber > currentVersionNumber) {
                    answer = true;
                    done = true;
                } else if (newVersionNumber < currentVersionNumber) {
                    answer = false;
                    done = true;
                }
            }
        }
        return answer;
    }
}
