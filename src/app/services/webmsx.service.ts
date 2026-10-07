import { Injectable } from '@angular/core';
import { Game } from '../models/game';
import { GameUtils } from '../models/game-utils';

@Injectable({
  providedIn: 'root'
})
export class WebmsxService {

  private readonly msxKeyCodeByCharacter = new Map<string, number>();
  private readonly F5_KEY_CODE = 25;
  private readonly STOP_KEY_CODE = 284;
  private readonly SHIFT_KEY_CODE = 301;
  private readonly CTRL_KEY_CODE = 302;
  private readonly CODE_KEY_CODE = 307;

  constructor() {
    this.initializeKeysMap();
  }

  startWebmsx() {
    const doneLoadingWMSXCheckInterval = setInterval(() => {
      if (typeof (window as any).WMSX !== undefined && typeof (window as any).WMSX.start !== undefined) {
        clearInterval(doneLoadingWMSXCheckInterval);
        (window as any).WMSX.start();
      }
    }, 20);
  }

  isDisk(game: Game) {
    return GameUtils.isDisk(game);
  }

  isTape(game: Game) {
    return GameUtils.isTape(game);
  }

  switchMedium(game: Game, medium: string) {
    if (this.isDisk(game)) {
      (window as any).WMSX.fileLoader.readFromURL(medium, (window as any).wmsx.FileLoader.OPEN_TYPE.DISK);
    } else if(this.isTape(game)) {
      (window as any).WMSX.fileLoader.readFromURL(medium, (window as any).wmsx.FileLoader.OPEN_TYPE.TAPE);
    }
  }

  async enterPassword(password: string, pressReturn: boolean) {
    const containsLowerCase = /[a-z]/.test(password);
    for (let i = 0; i < password.length; i++) {
      if (password.charAt(i) === ' ') {
        await this.pressKey(this.msxKeyCodeByCharacter.get('Space')!);
      } else {
        await this.pressKey(this.msxKeyCodeByCharacter.get(password.charAt(i).toUpperCase())!,
          containsLowerCase && !/[0-9]/.test(password.charAt(i)) && (password.charAt(i).toUpperCase() === password.charAt(i)));
      }
    }
    if (pressReturn) {
      await this.pressKey(this.msxKeyCodeByCharacter.get('Enter')!);
    }
  }

  async pressF5() {
    this.pressKey(this.F5_KEY_CODE);
  }

  async pressStop() {
    this.pressKey(this.STOP_KEY_CODE);
  }

  async pressCtrlStop() {
    this.pressKeyWithModifier(this.STOP_KEY_CODE, this.CTRL_KEY_CODE);
  }

  async pressCode() {
    this.pressKey(this.CODE_KEY_CODE);
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
    this.msxKeyCodeByCharacter.set('=', 223);
    this.msxKeyCodeByCharacter.set('[', 225);
    this.msxKeyCodeByCharacter.set(']', 226);
    this.msxKeyCodeByCharacter.set('\\', 229);
    this.msxKeyCodeByCharacter.set(',', 231);
    this.msxKeyCodeByCharacter.set('.', 232);
    this.msxKeyCodeByCharacter.set('/', 233);
  }

  private async pressKey(keyCode: number, handleUpperCase: boolean = false) {
    if (handleUpperCase) {
      await this.pressKeyWithModifier(keyCode, this.SHIFT_KEY_CODE);
    } else {
      await this.pressOneKey(keyCode);
    }
  }

  private async pressKeyWithModifier(keyCode: number, modifierKeyCode: number) {
    (window as any).WMSX.room.keyboard.processKey(modifierKeyCode, 1);
    await this.delay();
    await this.pressOneKey(keyCode);
    (window as any).WMSX.room.keyboard.processKey(modifierKeyCode, 0);
    await this.delay();
  }

  private async pressOneKey(keyCode: number) {
    (window as any).WMSX.room.keyboard.processKey(keyCode, 1);
    await this.delay();
    (window as any).WMSX.room.keyboard.processKey(keyCode, 0);
    await this.delay();
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, 80));
  };
}
