import { Game } from '../../../models/game';
import { NewsDatePipe } from './news-date.pipe';

describe('NewsDatePipe', () => {
  it('create an instance', () => {
    const pipe = new NewsDatePipe();
    expect(pipe).toBeTruthy();
  });
});

describe('NewsDatePipe', () => {
  it('transform function should return mm-dd for given date number', () => {
    const pipe = new NewsDatePipe();
    expect(pipe.transform(1695983612000)).toEqual('29-09');
    expect(pipe.transform(1693956423000)).toEqual('05-09');
    expect(pipe.transform(1696169805347)).toEqual('01-10');
  });
});
