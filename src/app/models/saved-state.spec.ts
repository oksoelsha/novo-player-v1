import { GameSavedState } from "./saved-state";

describe('GameSavedState', () => {
  it('should create an instance', () => {
    expect(new GameSavedState('state', 'screenshot')).toBeTruthy();
  });
});
