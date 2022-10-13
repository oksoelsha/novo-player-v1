import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Company } from '../../../models/company';
import { ComparisonOperator } from '../../../models/comparison-operator';
import { Country } from '../../../models/country';
import { CompanyFilter } from '../../../models/filter/company-filter';
import { CountryFilter } from '../../../models/filter/country-filter';
import { Filter } from '../../../models/filter/filter';
import { GenerationFilter } from '../../../models/filter/generation-filter';
import { GenreFilter } from '../../../models/filter/genre-filter';
import { MediumFilter } from '../../../models/filter/medium-filter';
import { SizesFilter } from '../../../models/filter/sizes-filter';
import { SoundFilter } from '../../../models/filter/sound-filter';
import { YearsFilter } from '../../../models/filter/years-filter';
import { FilterRange, Filters } from '../../../models/filters';
import { GameUtils } from '../../../models/game-utils';
import { Generation } from '../../../models/generation';
import { Genre } from '../../../models/genre';
import { Medium } from '../../../models/medium';
import { Size } from '../../../models/size';
import { Sound } from '../../../models/sound';
import { LocalizationService } from '../../../services/localization.service';
import { RangeItem } from './range-selector/range-selector.component';

class FilterButton {
  readonly filter: Filter;
  readonly label: string;

  constructor(filter: Filter, label: string) {
    this.filter = filter;
    this.label = label;
  }
}

@Component({
  selector: 'app-home-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.sass']
})
export class FiltersComponent implements OnInit {

  @Input() filters: Filters;
  @Output() appliedFilters: EventEmitter<Filters> = new EventEmitter<Filters>();

  readonly startYear = 1982;
  readonly endYear = 2026;

  media: string[] = [];
  localizedMediaReverse = new Map<string, string>();
  companies: string[] = [];
  countries: string[] = [];
  localizedCountriesReverse = new Map<string, string>();
  generations: string[] = [];
  sounds: string[] = [];
  soundsReverse = new Map<string, number>();
  genres: string[] = [];
  years: RangeItem[] = [];
  sizes: RangeItem[] = [];
  filterButtons: FilterButton[] = [];

  constructor(private localizationService: LocalizationService) { }

  ngOnInit(): void {
    Object.values(Medium).forEach(medium => {
      const localizedMedia = this.localizationService.translate('medium.' + medium);
      this.media.push(localizedMedia);
      this.localizedMediaReverse.set(localizedMedia, medium);
    });

    this.companies = Object.values(Company);

    Country.forEach(country => {
      const localizedCountry = this.localizationService.translate('country.' + country);
      this.countries.push(localizedCountry);
      this.localizedCountriesReverse.set(localizedCountry, country);
    });

    this.generations = Object.values(Generation);

    Sound.forEach(s => {
      this.sounds.push(s.label);
      this.soundsReverse.set(s.label, s.value);
    });

    this.genres = Object.assign([], Genre).sort();

    this.years = Array.from(Array(this.endYear - this.startYear + 1).keys())
      .map(x => x + this.startYear).map(n => new RangeItem(n, n.toString()));

    this.sizes = Size.map(s => new RangeItem(s.value, s.label));

    if (this.filters) {
      this.filters.filters.forEach(f1 => {
        f1.forEach(f2 => {
          this.addFilterButton(f2);
        });
      });
    }
  }

  applyMediumFilter(medium: string) {
    this.applyFilter(new MediumFilter(this.localizedMediaReverse.get(medium)));
  }

  applyCompanyFilter(company: string) {
    this.applyFilter(new CompanyFilter(company));
  }

  applyCountryFilter(country: string) {
    this.applyFilter(new CountryFilter(this.localizedCountriesReverse.get(country)));
  }

  applyGenerationFilter(generation: string) {
    this.applyFilter(new GenerationFilter(generation as Generation));
  }

  applySoundFilter(sound: string) {
    this.applyFilter(new SoundFilter(this.soundsReverse.get(sound)));
  }

  applyGenreFilter(genre: string) {
    this.applyFilter(new GenreFilter(GameUtils.getGenreCode(genre)));
  }

  applyYearsFilter(range: FilterRange) {
    this.applyFilter(new YearsFilter(range));
  }

  applySizesFilter(range: FilterRange) {
    this.applyFilter(new SizesFilter(range));
  }

  removeFilter(filterButton: FilterButton) {
    let found = false;
    let index = 0;
    while (!found && index < this.filterButtons.length) {
      if (filterButton.filter.constructor === this.filterButtons[index].filter.constructor &&
        filterButton.label === this.filterButtons[index].label) {
        found = true;
      } else {
        index++;
      }
    }
    this.filterButtons.splice(index, 1);
    this.filters.removeFilter(filterButton.filter);
    this.appliedFilters.emit(this.filters);
  }

  private applyFilter(filter: Filter) {
    this.filters.addFilter(filter);
    this.addFilterButton(filter);
    this.appliedFilters.emit(this.filters);
  }

  private addFilterButton(filter: Filter) {
    if (filter instanceof MediumFilter) {
      this.filterButtons.push(new FilterButton(filter, this.localizationService.translate('medium.' + filter.medium)));
    } else if (filter instanceof CompanyFilter) {
      this.filterButtons.push(new FilterButton(filter, filter.company));
    } else if (filter instanceof CountryFilter) {
      this.filterButtons.push(new FilterButton(filter, this.localizationService.translate('country.' + filter.country)));
    } else if (filter instanceof GenerationFilter) {
      this.filterButtons.push(new FilterButton(filter, filter.generation));
    } else if (filter instanceof SoundFilter) {
      this.filterButtons.push(new FilterButton(filter, Sound.filter(s => s.value === filter.sound).map(s => s.label)[0]));
    } else if (filter instanceof GenreFilter) {
      this.filterButtons.push(new FilterButton(filter, GameUtils.getGenre(filter.genre)));
    } else if (filter instanceof YearsFilter) {
      const rangeDisplay = this.getRangeDisplay(filter.years.start.toString(), filter.years.comparisonOperator,
        filter.years.end.toString());
      this.filterButtons.push(new FilterButton(filter, rangeDisplay));
    } else if (filter instanceof SizesFilter) {
      const startLabel = this.sizes[this.sizes.findIndex(s => s.value === filter.sizes.start)].label;
      let endDisplay: string;
      if (filter.sizes.comparisonOperator === ComparisonOperator.betweenInclusive) {
        endDisplay = this.sizes[this.sizes.findIndex(s => s.value === filter.sizes.end)].label;
      } else {
        endDisplay = '';
      }
      const rangeDisplay = this.getRangeDisplay(startLabel, filter.sizes.comparisonOperator, endDisplay);
      this.filterButtons.push(new FilterButton(filter, rangeDisplay));
    }
  }

  private getRangeDisplay(startDisplay: string, comparisonComparator: ComparisonOperator, endDisplay: string): string {
    let rangeDisplay: string;
    switch (comparisonComparator) {
      case ComparisonOperator.equal:
        rangeDisplay = '= ' + startDisplay;
        break;
      case ComparisonOperator.less:
        rangeDisplay = '< ' + startDisplay;
        break;
      case ComparisonOperator.lessOrEqual:
        rangeDisplay = '<= ' + startDisplay;
        break;
      case ComparisonOperator.greater:
        rangeDisplay = '> ' + startDisplay;
        break;
      case ComparisonOperator.greaterOrEqual:
        rangeDisplay = '>= ' + startDisplay;
        break;
      case ComparisonOperator.betweenInclusive:
        rangeDisplay = startDisplay + ' <= x <= ' + endDisplay;
        break;
    }
    return rangeDisplay;
  }
}
