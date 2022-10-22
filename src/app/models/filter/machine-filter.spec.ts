import { Game } from "../game";
import { MachineFilter } from "./machine-filter";

describe('MachineFilter', () => {
  it('MachineFilter should be constructed correctly', () => {
    const filter = new MachineFilter('machine-name');
    expect(filter.machine).toEqual('machine-name');
  });
});

describe('MachineFilter', () => {
  it('MachineFilter should filter game with matching filter machine', () => {
    const filter = new MachineFilter('machine-name');
    const game = new Game('name', '123', 123);
    game.setMachine('machine-name');
    expect(filter.isFiltered(game)).toBeTrue();
  });
});

describe('MachineFilter', () => {
  it('MachineFilter should not filter game with non matching filter machine', () => {
    const filter = new MachineFilter('machine-name');
    const game = new Game('name', '123', 123);
    game.setMachine('different-machine-name');
    expect(filter.isFiltered(game)).toBeFalse();
  });
});

describe('MachineFilter', () => {
  it('MachineFilter should not filter game with no machine set', () => {
    const filter = new MachineFilter('machine-name');
    const game = new Game('name', '123', 123);
    expect(filter.isFiltered(game)).toBeFalse();
  });
});
