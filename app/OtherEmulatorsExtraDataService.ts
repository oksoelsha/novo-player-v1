import * as fs from 'fs';
import { UpdateListerner } from './UpdateListerner';

export class OtherEmulatorExtraDataService implements UpdateListerner {

    private readonly extraDataPath: string;
    protected extraDataInfo: Map<string, string>;

    constructor(extraDataPath: string) {
        this.extraDataPath = extraDataPath;
        this.readExtraData();
    }

    protected getExtraDataInfo(): Map<string, string> {
        return this.extraDataInfo;
    }

    reinit(): void {
        this.readExtraData();
    }

    private readExtraData() {
        this.extraDataInfo = new Map<string, string>();

        let gameName: string;

        const data = fs.readFileSync(this.extraDataPath, { encoding: 'ascii' });
        const lines = data.split(/\r?\n/);
    
        lines.forEach((line) => {
            if (!line.startsWith('--')) {
                if (line.startsWith('#')) {
                    gameName = line.substring(1);
                } else {
                    this.extraDataInfo.set(line, gameName);
                }
            }
        });
    }
}
