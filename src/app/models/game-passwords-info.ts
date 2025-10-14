export class GamePasswordsInfo {
    readonly passwords: GamePassword[];
    readonly setup: string;
    readonly noTyping: boolean;

    constructor(passwords: GamePassword[], setup: string, noTyping: boolean) {
        this.passwords = passwords;
        this.setup = setup;
        this.noTyping = noTyping;
    }
}

export class GamePassword {
    readonly password: string;
    readonly description: string;
    readonly pressReturn: boolean;

    constructor(password: string, description: string, pressReturn: boolean = false) {
        this.password = password;
        this.description = description;
        this.pressReturn = pressReturn;
    }
}
