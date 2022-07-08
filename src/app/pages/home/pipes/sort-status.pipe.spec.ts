import { SortData, SortDirection } from '../home.component';
import { SortStatusPipe } from './sort-status.pipe';

describe('SortStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new SortStatusPipe();
    expect(pipe).toBeTruthy();
  });
});

describe('SortStatusPipe', () => {
  it('transform function should return the up arrow if given field is sorted in ascending order', () => {
    const pipe = new SortStatusPipe();
    let sortData: SortData;

    sortData = new SortData('name', SortDirection.ASC);
    expect(pipe.transform('name', sortData, [])).toEqual('↑');

    sortData = new SortData('company', SortDirection.ASC);
    expect(pipe.transform('company', sortData, [])).toEqual('↑');

    sortData = new SortData('year', SortDirection.ASC);
    expect(pipe.transform('year', sortData, [])).toEqual('↑');
  });
});

describe('SortStatusPipe', () => {
  it('transform function should return the down arrow if given field is sorted in descending order', () => {
    const pipe = new SortStatusPipe();
    let sortData: SortData;

    sortData = new SortData('name', SortDirection.DESC);
    expect(pipe.transform('name', sortData, [])).toEqual('↓');

    sortData = new SortData('company', SortDirection.DESC);
    expect(pipe.transform('company', sortData, [])).toEqual('↓');

    sortData = new SortData('year', SortDirection.DESC);
    expect(pipe.transform('year', sortData, [])).toEqual('↓');
  });
});

describe('SortStatusPipe', () => {
  it('transform function should return empty string if given field is not sorted', () => {
    const pipe = new SortStatusPipe();
    let sortData: SortData;

    sortData = new SortData('name', SortDirection.DESC);
    expect(pipe.transform('company', sortData, [])).toEqual('');

    sortData = new SortData('company', SortDirection.ASC);
    expect(pipe.transform('year', sortData, [])).toEqual('');

    sortData = new SortData('year', SortDirection.DESC);
    expect(pipe.transform('unknown', sortData, [])).toEqual('');
  });
});
