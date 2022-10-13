import { Game } from './game';
import { Genre } from './genre';

export class GameUtils {
    static isMSX(game: Game): boolean {
        return (game.generations & game.MASK_GENERATION_MSX) > 0;
    }

    static isMSX2(game: Game): boolean {
        return (game.generations & game.MASK_GENERATION_MSX2) > 0;
    }

    static isMSX2Plus(game: Game): boolean {
        return (game.generations & game.MASK_GENERATION_MSX2PLUS) > 0;
    }

    static isTurboR(game: Game): boolean {
        return (game.generations & game.MASK_GENERATION_TURBO_R) > 0;
    }

    static isPSG(game: Game): boolean {
        return (game.sounds & game.MASK_SOUND_PSG) > 0;
    }

    static isSCC(game: Game): boolean {
        return (game.sounds & game.MASK_SOUND_SCC) > 0;
    }

    static isSCCI(game: Game): boolean {
        return (game.sounds & game.MASK_SOUND_SCC_I) > 0;
    }

    static isPCM(game: Game): boolean {
        return (game.sounds & game.MASK_SOUND_PCM) > 0;
    }

    static isMSXMusic(game: Game): boolean {
        return (game.sounds & game.MASK_SOUND_MSX_MUSIC) > 0;
    }

    static isMSXAudio(game: Game): boolean {
        return (game.sounds & game.MASK_SOUND_MSX_AUDIO) > 0;
    }

    static isMoonsound(game: Game): boolean {
        return (game.sounds & game.MASK_SOUND_MOONSOUND) > 0;
    }

    static isMidi(game: Game): boolean {
        return (game.sounds & game.MASK_SOUND_MIDI) > 0;
    }

    static getGenre(genre: number): string {
        if (genre < 1 || genre >= Genre.length) {
            return null;
        } else {
            return Genre[genre];
        }
    }

    static getGenreCode(genre: string): number {
        const code = Genre.indexOf(genre);
        if (code <= 0) {
            return 0;
        } else {
            return code;
        }
    }

    static getMonikor(game: Game): any {
        return {name: game.name, listing: game.listing};
    }

    static getGenerationMSXURLForGame(generationMSXId: number) {
        return 'http://www.generation-msx.nl/msxdb/softwareinfo/' + generationMSXId;
    }
}
