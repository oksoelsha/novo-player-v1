import { RecentActivity } from '../recent-activity';
import { RecentActivityFilter } from './recent-activity-filter';

describe('RecentActivityFilter', () => {
  it('RecentActivityFilter should be constructed correctly', () => {
    const filter = new RecentActivityFilter(RecentActivity.recentlyAdded, null);
    expect(filter.recentActivity).toEqual(RecentActivity.recentlyAdded);
  });
});
