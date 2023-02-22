import { OperationCacheService } from '../../services/operation-cache.service';
import { Game } from '../game';
import { RecentActivity } from '../recent-activity';
import { Filter } from './filter';

export class RecentActivityFilter implements Filter {

    readonly recentActivity: string;
    readonly operationCacheService: OperationCacheService;

    constructor(recentActivity: string, operationCacheService: OperationCacheService) {
        this.recentActivity = recentActivity;
        this.operationCacheService = operationCacheService;
    }

    isFiltered(game: Game): boolean {
        if (this.recentActivity === RecentActivity.recentlyAdded) {
            return this.operationCacheService.isRecentlyAdded(game);
        } else if (this.recentActivity === RecentActivity.recentlyUpdated) {
            return this.operationCacheService.isRecentlyUpdated(game);
        }
    }

    getIdentifier(): string {
        return this.recentActivity;
    }
}
