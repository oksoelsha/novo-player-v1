import { RecentActivity } from '../recent-activity';
import { RecentActivityFilter } from './recent-activity-filter';

describe('RecentActivityFilter', () => {
  it('RecentActivityFilter should be constructed correctly', () => {
    const filter = new RecentActivityFilter(RecentActivity.recentlyAdded, null);
    expect(filter.recentActivity).toEqual(RecentActivity.recentlyAdded);
  });
});

describe('RecentActivityFilter', () => {
  it('RecentActivityFilter should return correct identifier', () => {
    const filter = new RecentActivityFilter(RecentActivity.recentlyUpdated, null);
    expect(filter.getIdentifier()).toEqual(RecentActivity.recentlyUpdated);
  });
});
