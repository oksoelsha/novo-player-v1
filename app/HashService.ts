import crc32 from 'crc/crc32';
import md5File from 'md5-file';
import * as crypto from 'crypto';
import { BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import pLimit from 'p-limit';
import { Stream } from 'stream';
import { Game } from '../src/app/models/game';
import { FileTypeUtils } from './utils/FileTypeUtils';
import { GameUtils } from './utils/GameUtils';

export class HashService {

    private smallFileScanBatchSize: any;
    private largeFileScanBatchSize: any;

    constructor(private win: BrowserWindow) {
        this.smallFileScanBatchSize = pLimit(50);
        this.largeFileScanBatchSize = pLimit(1);
        this.init();
     }

    getSha1Code(filename: string): Promise<any> {
        let sha1: Promise<any>;
        if (fs.statSync(filename)['size'] > 10485760) {
            // any files larger than 10Mb are considered large that we need to send them to the more limited promise batch size
            sha1 = this.largeFileScanBatchSize(() => this.getSha1(filename).catch(error => null));
        } else {
            sha1 = this.smallFileScanBatchSize(() => this.getSha1(filename).catch(error => null));
        }

        return sha1;
    }

    private init() {
        ipcMain.on('getMoreGameHashes', (event, game: Game) => {
            this.getMoreGameHashes(game);
        });
    }

    private getSha1(filename: string): Promise<any> {
        const shasum = crypto.createHash('sha1');
        if (FileTypeUtils.isZip(filename)) {
            const StreamZip = require('node-stream-zip');
            return new Promise<any>((resolve, reject) => {
                const zip = new StreamZip({
                    file: filename,
                    storeEntries: true
                });
                zip.on('error', (err: string) => {
                    return reject(err);
                });
                zip.on('ready', () => {
                    const entries = Object.keys(zip.entries()).map(e => zip.entries()[e]);
                    const msxFileIndex = this.getMSXFileIndexInZip(entries);
                    if (msxFileIndex < entries.length) {
                        zip.stream(entries[msxFileIndex].name, function (err: string, stm: Stream) {
                            stm.on('data', function (data) {
                                shasum.update(data);
                            });
                            stm.on('end', function () {
                                const hash = shasum.digest('hex');
                                zip.close();
                                return resolve({hash: hash, size: entries[msxFileIndex].size, filename: entries[msxFileIndex].name});
                            });
                        })
                    } else {
                        return resolve(null);
                    }
                });
            });
        } else {
            return new Promise<any>((resolve, reject) => {
                const s: fs.ReadStream = fs.createReadStream(filename);
                s.on('data', function (data) {
                    shasum.update(data);
                })
                s.on('end', function () {
                    const hash = shasum.digest('hex');
                    return resolve({hash: hash, size: fs.statSync(filename)['size'], filename: filename});
                })
            });
        }
    }

    private getMSXFileIndexInZip(entries: any): number {
        let index: number;
        for(index = 0; index < entries.length; index++) {
            if (!FileTypeUtils.isZip(entries[index].name) && FileTypeUtils.isMSXFile(entries[index].name)) {
                return index;
            }
        }

        return index;
    }

    private getMoreGameHashes(game: Game) {
        const mainFilename = GameUtils.getGameMainFile(game);
        const crc32Hash = crc32(fs.readFileSync(mainFilename)).toString(16);
        const md5Hash = md5File.sync(mainFilename);
        this.win.webContents.send('getMoreGameHashesResponse', { crc32: crc32Hash, md5: md5Hash });
    }
}
