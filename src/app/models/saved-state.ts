export class GameSavedState {
    state: string;
    screenshot: string;

    constructor(state: string, screenshot: string) {
        this.state = state;
        this.screenshot = screenshot;
    }
}
