import { LongEventDatePipe } from "./long-event-date.pipe";

describe('LongEventDatePipe', () => {
  it('create an instance', () => {
    const pipe = new LongEventDatePipe();
    expect(pipe).toBeTruthy();
  });
});

describe('LongEventDatePipe', () => {
  it('transform function should return mm-dd for given date number', () => {
    const pipe = new LongEventDatePipe();
    expect(pipe.transform(1698847666000)).toEqual(new Date(1698847666000).toLocaleString());
    expect(pipe.transform(1696038322000)).toEqual(new Date(1696038322000).toLocaleString());
  });
});
