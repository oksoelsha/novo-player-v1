import { OperationCacheService } from '../services/operation-cache.service';
import { CompanyFilter } from './filter/company-filter';
import { CountryFilter } from './filter/country-filter';
import { FDDModeFilter } from './filter/fddmode-filter';
import { GenerationFilter } from './filter/generation-filter';
import { GenreFilter } from './filter/genre-filter';
import { InputDeviceFilter } from './filter/inputdevice-filter';
import { MachineFilter } from './filter/machine-filter';
import { MediumFilter } from './filter/medium-filter';
import { RecentActivityFilter } from './filter/recent-activity-filter';
import { SizesFilter } from './filter/sizes-filter';
import { SoundFilter } from './filter/sound-filter';
import { VideoSourceFilter } from './filter/videosource-filter';
import { YearsFilter } from './filter/years-filter';
import { FilterRange, Filters } from './filters';
import { Generation } from './generation';

export class FilterUtils {
    static convertToFilters(filtersObject: any, operationCacheService: OperationCacheService): Filters {
        const filters = new Filters();
        filtersObject.forEach((f1: any[]) => {
            f1.forEach(f2 => {
                if ('medium' in f2) {
                    filters.addFilter(new MediumFilter(f2.medium));
                } else if ('company' in f2) {
                    filters.addFilter(new CompanyFilter(f2.company));
                } else if ('country' in f2) {
                    filters.addFilter(new CountryFilter(f2.country));
                } else if ('generation' in f2) {
                    filters.addFilter(new GenerationFilter(f2.generation as Generation));
                } else if ('sound' in f2) {
                    filters.addFilter(new SoundFilter(f2.sound));
                } else if ('genre' in f2) {
                    filters.addFilter(new GenreFilter(f2.genre));
                } else if ('years' in f2) {
                    filters.addFilter(new YearsFilter(new FilterRange(f2.years.start, f2.years.comparisonOperator, f2.years.end)));
                } else if ('sizes' in f2) {
                    filters.addFilter(new SizesFilter(new FilterRange(f2.sizes.start, f2.sizes.comparisonOperator, f2.sizes.end)));
                } else if ('machine' in f2) {
                    filters.addFilter(new MachineFilter(f2.machine));
                } else if ('inputDevice' in f2) {
                    filters.addFilter(new InputDeviceFilter(f2.inputDevice));
                } else if ('fddMode' in f2) {
                    filters.addFilter(new FDDModeFilter(f2.fddMode));
                } else if ('checkGFX9000' in f2) {
                    filters.addFilter(new VideoSourceFilter(f2.checkGFX9000));
                } else if ('recentActivity' in f2) {
                    filters.addFilter(new RecentActivityFilter(f2.recentActivity, operationCacheService));
                }
            });
        });
        return filters;
    }
}
