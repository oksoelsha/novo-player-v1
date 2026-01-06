import { BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateListerner } from './UpdateListerner';
import { EnvironmentService } from './EnvironmentService';

export class ColecoExtraDataService implements UpdateListerner {

    private colecoExtraDataPathInBundle = path.join(__dirname, 'extra/coleco-extra-data.dat');
    private colecoExtraDataInfo: Map<string, string>;
    private colecoExtraDataVersion = '';

    constructor(private win: BrowserWindow, private environmentService: EnvironmentService) {
        this.init();
    }

    getColecoExtraDataInfo(): Map<string, string> {
        return this.colecoExtraDataInfo;
    }

    reinit(): void {
        this.readExtraData();
    }

    getColecoExtraDataVersion(): string {
        return this.colecoExtraDataVersion;
    }

    private init(): void {
        this.readExtraData();
    }

    private readExtraData() {
        this.colecoExtraDataInfo = new Map();

        let gameName: string;

        const data = fs.readFileSync(this.colecoExtraDataPathInBundle, { encoding: 'ascii' });
        const lines = data.split(/\r?\n/);
    
        lines.forEach((line) => {
            if (!line.startsWith('--')) {
                if (line.startsWith('#')) {
                    gameName = line.substring(1);
                } else {
                    this.colecoExtraDataInfo.set(line, gameName);
                }
            } else {
                const lineParts = line.split(/\s/);
                if (lineParts.length >= 3) {
                    if (lineParts[1] === 'Version') {
                        this.colecoExtraDataVersion = lineParts[2];
                    }
                }
            }
        });
    }
}
