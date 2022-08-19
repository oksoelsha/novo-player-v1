import { BrowserWindow, ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { UpdateListerner } from './UpdateListerner';

export class ExtraDataService implements UpdateListerner {

    private extraDataPath: string = path.join(__dirname, 'extra/extra-data.dat');
    private extraDataInfo: Map<string, ExtraData> = new Map();
    private extraDataVersion = '';

    constructor(private win: BrowserWindow) {
        this.init();
    }

    private init(): void {
        ipcMain.on('getExtraDataVersion', (event, arg) => {
            this.sendExtraDataVersion();
        });

        let readInfo: boolean = false;
        let readCodes: boolean = false;
    
        let generationMSXID: number;
        let generations: number;
        let soundChips: number;
        let genre1: number;
        let genre2: number;
        let suffix: string;
        let extraData: ExtraData;

        const data = fs.readFileSync(this.extraDataPath, { encoding: 'ascii' });
        const lines = data.split(/\r?\n/);
    
        lines.forEach((line) => {
            if (!line.startsWith('--')) {
                if (line.startsWith('#')) {
                    generationMSXID = +line.substring(1);
                    readInfo = true;
                } else if (readInfo) {
                    const tokens: string[] = line.split(',');
                    generations = +tokens[0];
                    soundChips = +tokens[1];
                    if (tokens.length > 2) {
                        const genres: string[] = tokens[2].split('|');
                        genre1 = +genres[0];
                        if (genres.length > 1) {
                            genre2 = +genres[1];
                        } else {
                            genre2 = 0;
                        }
                    } else {
                        genre1 = 0;
                        genre2 = 0;
                    }
                    if (tokens.length > 3) {
                        suffix = tokens[3];
                    } else {
                        suffix = null;
                    }
    
                    extraData = new ExtraData(generationMSXID, generations, soundChips,
                        genre1, genre2, suffix);

                    readInfo = false;
                    readCodes = true;
                } else if (readCodes) {
                    const codes: string[] = line.split('|');
                    codes.forEach((code) => {
                        this.extraDataInfo.set(code, extraData);
                    })
    
                    readCodes = false;
                }
            } else {
                const lineParts: string[] = line.split(/\s/);
                if (lineParts.length >= 3) {
                    if (lineParts[1] == 'Version') {
                        this.extraDataVersion = lineParts[2];
                    }
                }
            }
        });
    }

    getExtraDataInfo(): Map<string, ExtraData> {
        return this.extraDataInfo;
    }

    reinit(): void {
        this.init();
    }

    sendExtraDataVersion(): void {
        this.win.webContents.send('getExtraDataVersionResponse', this.extraDataVersion);
    }

    getExtraDataVersion(): string {
        return this.extraDataVersion;
    }
}

export class ExtraData {
    generationMSXID: number;
    generations: number;
    soundChips: number;
    genre1: number;
    genre2: number;
    suffix: string;

    constructor(generationMSXID: number, generations: number, soundChips: number,
        genre1: number, genre2: number, suffix: string) {
        this.generationMSXID = generationMSXID;
        this.generations = generations;
        this.genre1 = genre1;
        this.genre2 = genre2;
        this.soundChips = soundChips;
        this.suffix = suffix;
    }
}
