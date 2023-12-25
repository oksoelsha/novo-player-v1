import * as path from 'path';
import * as fs from 'fs';
import { BrowserWindow, ipcMain } from 'electron'
import { GamePasswordsInfo } from '../src/app/models/game-passwords-info';

export class GamePasswordsService {
    private gamePasswords: string = path.join(__dirname, 'extra/passwords.json');
    private gamePasswordsInfo: Map<string, GamePasswordsInfo> = new Map();

    constructor(private win: BrowserWindow) {
        this.init();
    }

    private init(): void {
        ipcMain.on('getGamePasswords', (event, generationMSXID: number) => {
            this.getGamePasswords(generationMSXID);
        });
        this.readGamePasswordData();
    }

    private readGamePasswordData() {
        const fileData = fs.readFileSync(this.gamePasswords);
        this.gamePasswordsInfo = JSON.parse(fileData.toString());

        this.gamePasswordsInfo = new Map(Object.entries(JSON.parse(fileData.toString()))) 
    }

    private getGamePasswords(generationMSXID: number) {
        this.win.webContents.send('getGamePasswordsResponse' + generationMSXID, this.gamePasswordsInfo.get('' + generationMSXID));
    }
}
