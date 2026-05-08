import { Game } from '../../src/app/models/game';
import { PersistenceUtils } from '../utils/PersistenceUtils';

export class GameDO {
    name!: string;
    _id: string;        // this will be used for the sha1Code field
    size!: number;
    machine!: string;

    romA: string | undefined;
    romB: string | undefined;
    extensionRom: string | undefined;
    extensionRom2: string | undefined;
    diskA: string | undefined;
    diskB: string | undefined;
    tape: string | undefined;
    harddisk: string | undefined;
    laserdisc: string | undefined;

    generationMSXId: number | undefined;
    generations: number | undefined;
    sounds: number | undefined;
    genre1: number | undefined;
    genre2: number | undefined;
    screenshotSuffix: string | undefined;
    colecoScreenshot: string | undefined;
    spectravideoScreenshot: string | undefined;
    segaScreenshot: string | undefined;

    listing!: string;

    fddMode: number | undefined;
    inputDevice: number | undefined;
    connectGFX9000: boolean | undefined;

    favorite: boolean | undefined;

    infoFile: string | undefined;

    bluemsxArguments: string | undefined;
    bluemsxOverrideSettings: boolean | undefined;

    webmsxMachine: number | undefined;

    emuliciousArguments: string | undefined;
    emuliciousOverrideSettings: boolean | undefined;

    constructor(game: Game) {
        for (var field of PersistenceUtils.fieldsToPersist) {
            if (game[field as keyof Game] !== undefined) {
                (this as any)[field] = game[field];
            }
         }
         this._id = game.sha1Code;
    }
}
