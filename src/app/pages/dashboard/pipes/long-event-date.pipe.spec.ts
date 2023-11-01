import { LongEventDatePipe } from './long-event-date.pipe';

describe('LongEventDatePipe', () => {
  it('create an instance', () => {
    const pipe = new LongEventDatePipe();
    expect(pipe).toBeTruthy();
  });
});

describe('LongEventDatePipe', () => {
  it('transform function should return mm-dd for given date number', () => {
    const pipe = new LongEventDatePipe();
    expect(pipe.transform(1698847666000)).toEqual('11/1/2023, 10:07:46 AM');
    expect(pipe.transform(1696038322000)).toEqual('9/29/2023, 9:45:22 PM');
  });
});
