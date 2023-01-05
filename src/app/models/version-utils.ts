export class VersionUtils {
    static isVersionNewer(currentVersion: string, newVersion: string): boolean {
        let answer = false;
        if (currentVersion && newVersion) {
            const currentVersionDigits = currentVersion.split('.');
            const newVersionDigits = newVersion.split('.');

            let done = false;
            let counter = 0;
            while (!done) {
                let currentVersionNumber: number;
                let newVersionNumber: number;
                if (currentVersionDigits.length > counter && newVersionDigits.length > counter) {
                    currentVersionNumber = +currentVersionDigits[counter];
                    newVersionNumber = +newVersionDigits[counter];
                    if (newVersionNumber > currentVersionNumber) {
                        answer = true;
                        done = true;
                    } else {
                        counter++;
                    }
                } else {
                    // pad the one with shorter length with a 0
                    if (currentVersionDigits.length > counter && newVersionDigits.length === counter) {
                        currentVersionNumber = +currentVersionDigits[counter];
                        newVersionNumber = 0;
                    } else if (currentVersionDigits.length === counter && newVersionDigits.length > counter) {
                        currentVersionNumber = 0;
                        newVersionNumber = +newVersionDigits[counter];
                    } else {
                        currentVersionNumber = 0;
                        newVersionNumber = 0;
                    }

                    if (newVersionNumber > currentVersionNumber) {
                        answer = true;
                    }

                    done = true;
                }
            }
        }
        return answer;
    }
}
