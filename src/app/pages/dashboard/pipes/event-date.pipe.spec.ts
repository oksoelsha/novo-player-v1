import { EventDatePipe } from './event-date.pipe';

describe('EventDatePipe', () => {
  it('create an instance', () => {
    const pipe = new EventDatePipe();
    expect(pipe).toBeTruthy();
  });
});

describe('EventDatePipe', () => {
  it('transform function should return mm-dd for given date number', () => {
    const pipe = new EventDatePipe();
    expect(pipe.transform(1698847666000)).toEqual('01-11 10:07');
    expect(pipe.transform(1696038322000)).toEqual('29-9 21:45');
  });
});
