import { FilterUtils } from './filter-utils';
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

describe('FilterUtils', () => {
  it('Conversion function should return instance of Filters for given filters object', () => {
    const filtersObject = [
      [
        {
          medium: 'rom'
        }
      ],
      [
        {
          company: 'Konami'
        }
      ],
      [
        {
          company: 'ASCII'
        }
      ],
      [
        {
          country: 'JP'
        }
      ],
      [
        {
          generation: 'MSX'
        }
      ],
      [
        {
          sound: 1
        }
      ],
      [
        {
          genre: 2
        }
      ],
      [
        {
          years: {
            start: 1983,
            comparisonOperator: 'greaterOrEqual',
            end: 0
          }
        }
      ],
      [
        {
          sizes: {
            start: 16384,
            comparisonOperator: 'betweenInclusive',
            end: 2097152
          }
        }
      ],
      [
        {
          machine: 'Boosted_MSX2_EN'
        }
      ],
      [
        {
          fddMode: 0
        }
      ],
      [
        {
          inputDevice: 3
        }
      ],
      [
        {
          checkGFX9000: true
        }
      ],
      [
        {
          recentActivity: 'recentlyadded',
          operationCacheService: {
            cacheTTL: 21600000,
            recentlyAddedCache: {
              cache: {},
              defaultTtl: 21600000
            },
            recentlyUpdatedCache: {
              cache: {},
              defaultTtl: 21600000
            }
          }
        }
      ]
    ];
    const filters = FilterUtils.convertToFilters(filtersObject, null);
    expect(filters.filters.length).toEqual(13);
    expect(filters.filters[0][0]).toBeInstanceOf(MediumFilter);
    expect((filters.filters[0][0] as MediumFilter).medium).toEqual('rom');

    expect(filters.filters[1][0]).toBeInstanceOf(CompanyFilter);
    expect((filters.filters[1][0] as CompanyFilter).company).toEqual('Konami');
    expect(filters.filters[1][1]).toBeInstanceOf(CompanyFilter);
    expect((filters.filters[1][1] as CompanyFilter).company).toEqual('ASCII');

    expect(filters.filters[2][0]).toBeInstanceOf(CountryFilter);
    expect((filters.filters[2][0] as CountryFilter).country).toEqual('JP');

    expect(filters.filters[3][0]).toBeInstanceOf(GenerationFilter);
    expect((filters.filters[3][0] as GenerationFilter).generation).toEqual('MSX');

    expect(filters.filters[4][0]).toBeInstanceOf(SoundFilter);
    expect((filters.filters[4][0] as SoundFilter).sound).toEqual(1);

    expect(filters.filters[5][0]).toBeInstanceOf(GenreFilter);
    expect((filters.filters[5][0] as GenreFilter).genre).toEqual(2);

    expect(filters.filters[6][0]).toBeInstanceOf(YearsFilter);
    expect((filters.filters[6][0] as YearsFilter).years.start).toEqual(1983);
    expect((filters.filters[6][0] as YearsFilter).years.comparisonOperator).toEqual('greaterOrEqual');
    expect((filters.filters[6][0] as YearsFilter).years.end).toEqual(0);

    expect(filters.filters[7][0]).toBeInstanceOf(SizesFilter);
    expect((filters.filters[7][0] as SizesFilter).sizes.start).toEqual(16384);
    expect((filters.filters[7][0] as SizesFilter).sizes.comparisonOperator).toEqual('betweenInclusive');
    expect((filters.filters[7][0] as SizesFilter).sizes.end).toEqual(2097152);

    expect(filters.filters[8][0]).toBeInstanceOf(MachineFilter);
    expect((filters.filters[8][0] as MachineFilter).machine).toEqual('Boosted_MSX2_EN');

    expect(filters.filters[9][0]).toBeInstanceOf(FDDModeFilter);
    expect((filters.filters[9][0] as FDDModeFilter).fddMode).toEqual(0);

    expect(filters.filters[10][0]).toBeInstanceOf(InputDeviceFilter);
    expect((filters.filters[10][0] as InputDeviceFilter).inputDevice).toEqual(3);

    expect(filters.filters[11][0]).toBeInstanceOf(VideoSourceFilter);
    expect((filters.filters[11][0] as VideoSourceFilter).checkGFX9000).toBeTrue();

    expect(filters.filters[12][0]).toBeInstanceOf(RecentActivityFilter);
    expect((filters.filters[12][0] as RecentActivityFilter).recentActivity).toEqual('recentlyadded');
  });
});
