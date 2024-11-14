import { Injectable } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class WebmsxService {

  private msxKeyCodeByCharacter = new Map<string, number>();

  constructor() {
    this.initializeKeysMap();
  }

  startWebmsx() {
    const doneLoadingWMSXCheckInterval = setInterval(() => {
      if (typeof window['WMSX'] !== 'undefined' && typeof window['WMSX'].start !== 'undefined') {
        clearInterval(doneLoadingWMSXCheckInterval);
        window['WMSX'].start();
      }
    }, 20);
  }

  isDisk(game: Game) {
    return game.romA == null && game.diskA != null;
  }

  isTape(game: Game) {
    return game.romA == null && game.diskA == null && game.tape != null;
  }

  switchMedium(game: Game, medium: string) {
    if (this.isDisk(game)) {
      window['WMSX'].fileLoader.readFromURL(medium, window['wmsx'].FileLoader.OPEN_TYPE.DISK);
    } else if(this.isTape(game)) {
      window['WMSX'].fileLoader.readFromURL(medium, window['wmsx'].FileLoader.OPEN_TYPE.TAPE);
    }
  }

  async enterPassword(password: string, pressReturn: boolean) {
    for (let i = 0; i < password.length; i++) {
      if (password[i] === ' ') {
        await this.pressKey(this.msxKeyCodeByCharacter.get('Space'));
      } else {
        await this.pressKey(this.msxKeyCodeByCharacter.get(password[i]));
      }
    }
    if (pressReturn) {
      await this.pressKey(this.msxKeyCodeByCharacter.get('Enter'));
    }
  }

  private initializeKeysMap() {
    this.msxKeyCodeByCharacter.set('1', 1);
    this.msxKeyCodeByCharacter.set('2', 2);
    this.msxKeyCodeByCharacter.set('3', 3);
    this.msxKeyCodeByCharacter.set('4', 4);
    this.msxKeyCodeByCharacter.set('5', 5);
    this.msxKeyCodeByCharacter.set('6', 6);
    this.msxKeyCodeByCharacter.set('7', 7);
    this.msxKeyCodeByCharacter.set('8', 8);
    this.msxKeyCodeByCharacter.set('9', 9);
    this.msxKeyCodeByCharacter.set('0', 10);
    this.msxKeyCodeByCharacter.set('Q', 101);
    this.msxKeyCodeByCharacter.set('W', 102);
    this.msxKeyCodeByCharacter.set('E', 103);
    this.msxKeyCodeByCharacter.set('R', 104);
    this.msxKeyCodeByCharacter.set('T', 105);
    this.msxKeyCodeByCharacter.set('Y', 106);
    this.msxKeyCodeByCharacter.set('U', 107);
    this.msxKeyCodeByCharacter.set('I', 108);
    this.msxKeyCodeByCharacter.set('O', 109);
    this.msxKeyCodeByCharacter.set('P', 110);
    this.msxKeyCodeByCharacter.set('A', 111);
    this.msxKeyCodeByCharacter.set('S', 112);
    this.msxKeyCodeByCharacter.set('D', 113);
    this.msxKeyCodeByCharacter.set('F', 114);
    this.msxKeyCodeByCharacter.set('G', 115);
    this.msxKeyCodeByCharacter.set('H', 116);
    this.msxKeyCodeByCharacter.set('J', 117);
    this.msxKeyCodeByCharacter.set('K', 118);
    this.msxKeyCodeByCharacter.set('L', 119);
    this.msxKeyCodeByCharacter.set('Z', 120);
    this.msxKeyCodeByCharacter.set('X', 121);
    this.msxKeyCodeByCharacter.set('C', 122);
    this.msxKeyCodeByCharacter.set('V', 123);
    this.msxKeyCodeByCharacter.set('B', 124);
    this.msxKeyCodeByCharacter.set('N', 125);
    this.msxKeyCodeByCharacter.set('M', 126);
    this.msxKeyCodeByCharacter.set('Enter', 204);
    this.msxKeyCodeByCharacter.set('Space', 205);
    this.msxKeyCodeByCharacter.set('-', 222);
  }

  private async pressKey(keyCode: number) {
    window['WMSX'].room.keyboard.processKey(keyCode, 1);
    await this.delay();
    window['WMSX'].room.keyboard.processKey(keyCode, 0);
    await this.delay();
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, 80));
  };
}
