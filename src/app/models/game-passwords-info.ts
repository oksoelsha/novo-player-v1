export class GamePasswordsInfo {
    readonly setup: string;
    readonly passwords: GamePassword[];

    constructor(passwords: GamePassword[], setup: string) {
        this.passwords = passwords;
        this.setup = setup;
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