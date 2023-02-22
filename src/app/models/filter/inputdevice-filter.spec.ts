import { Game } from '../game';
import { InputDeviceFilter } from './inputdevice-filter';

describe('InputDeviceFilter', () => {
  it('InputDeviceFilter should be constructed correctly', () => {
    const filter = new InputDeviceFilter(2);
    expect(filter.inputDevice).toEqual(2);
  });
});

describe('InputDeviceFilter', () => {
  it('InputDeviceFilter should filter game with matching filter input device', () => {
    const filter = new InputDeviceFilter(2);
    const game = new Game('name', '123', 123);
    game.setInputDevice(2);
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('InputDeviceFilter', () => {
  it('InputDeviceFilter should not filter game with non matching filter input device', () => {
    const filter = new InputDeviceFilter(2);
    const game = new Game('name', '123', 123);
    game.setInputDevice(3);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('InputDeviceFilter', () => {
  it('InputDeviceFilter should not filter game with no input device set and game with non-default input device', () => {
    const filter = new InputDeviceFilter(2);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('InputDeviceFilter', () => {
  it('InputDeviceFilter should filter game with input device set and game with default input device', () => {
    const filter = new InputDeviceFilter(0);
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('InputDeviceFilter', () => {
  it('InputDeviceFilter should return correct identifier', () => {
    const filter = new InputDeviceFilter(2);
    expect(filter.getIdentifier()).toEqual('2');
  });
});
