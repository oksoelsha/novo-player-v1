import crc32 from 'crc/crc32';
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
            sha1 = this.largeFileScanBatchSize(() => this.getHash(filename, 'sha1').catch(error => null));
        } else {
            sha1 = this.smallFileScanBatchSize(() => this.getHash(filename, 'sha1').catch(error => null));
        }

        return sha1;
    }

    private init() {
        ipcMain.on('getMoreGameHashes', (event, game: Game) => {
            this.getMoreGameHashes(game);
        });
    }

    private getHash(filename: string, algorithm: string): Promise<any> {
        const shasum = crypto.createHash(algorithm);
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
                        zip.stream(entries[msxFileIndex].name, (err: string, stm: Stream) => {
                            stm.on('data', (data) => {
                                shasum.update(data);
                            });
                            stm.on('end', () => {
                                const hash = shasum.digest('hex');
                                zip.close();
                                return resolve({
                                    algorithm: algorithm,
                                    hash: hash,
                                    size: entries[msxFileIndex].size,
                                    filename: entries[msxFileIndex].name
                                });
                            });
                        });
                    } else {
                        return resolve({
                            algorithm: algorithm,
                            hash: '-',
                            size: 0,
                            filename: ''
                        });
                    }
                });
            });
        } else {
            return new Promise<any>((resolve, reject) => {
                const stream = fs.createReadStream(filename);
                stream.on('data', (data: crypto.BinaryLike) => {
                    shasum.update(data);
                });
                stream.on('error', (err) => {
                    return resolve({
                        algorithm: algorithm,
                        hash: '-'});
                });
                stream.on('end', () => {
                    const hash = shasum.digest('hex');
                    return resolve({
                        algorithm: algorithm,
                        hash: hash,
                        size: fs.statSync(filename)['size'],
                        filename: filename});
                });
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
        const allHashes: Promise<any>[] = [];
        allHashes.push(this.getCRC32(mainFilename));
        allHashes.push(this.getMD5(mainFilename));
        allHashes.push(this.getSha256(mainFilename));

        const result = {};
        Promise.allSettled(allHashes).then((hashes) => {
            hashes.forEach((hash) => {
                if (hash.status === 'fulfilled') {
                    result[hash.value.algorithm] = hash.value.hash;
                }
            });
            this.win.webContents.send('getMoreGameHashesResponse', result);
        });
    }

    private async getCRC32(filename: string): Promise<any> {
        if (FileTypeUtils.isZip(filename)) {
            const StreamZip = require('node-stream-zip');
            const zip = new StreamZip.async({ file: filename });
            const entries = await zip.entries();
            const entriesArray = Object.keys(entries).map(e => entries[e]);
            const msxFileIndex = this.getMSXFileIndexInZip(entriesArray);
            if (msxFileIndex < entriesArray.length) {
                const data = await zip.entryData(entriesArray[msxFileIndex].name);
                await zip.close();
                return { algorithm: 'crc32', hash: crc32(data).toString(16) };
            } else {
                await zip.close();
                return { algorithm: 'crc32', hash: '-' };
            }
        } else {
            let contents: Buffer;
            try {
                contents = fs.readFileSync(filename);
                return { algorithm: 'crc32', hash: crc32(contents).toString(16) };
            } catch (error) {
                return { algorithm: 'crc32', hash: '-' };
            }
        }
    }

    private async getMD5(filename: string): Promise<any> {
        return this.getHash(filename, 'md5');
    }

    private async getSha256(filename: string): Promise<any> {
        return this.getHash(filename, 'sha256');
    }
}
