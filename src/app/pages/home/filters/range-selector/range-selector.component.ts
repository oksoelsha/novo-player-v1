import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ComparisonOperator } from '../../../../models/comparison-operator';
import { FilterRange } from '../../../../models/filters';
import { LocalizationService } from '../../../../services/localization.service';

export class RangeItem {
  value: number;
  label: string;

  constructor(value: number, label: string) {
    this.value = value;
    this.label = label;
  }
}

@Component({
  selector: 'app-home-filters-range-selector',
  templateUrl: './range-selector.component.html',
  styleUrls: ['../../../../common-styles.sass', './range-selector.component.sass']
})
export class RangeSelectorComponent implements OnInit {

  @Input() range: RangeItem[];
  @Output() selectedRange: EventEmitter<FilterRange> = new EventEmitter<FilterRange>();

  start: string;
  startValue: number;
  enableComparison: boolean;
  comparisonOpearators: string[] = [];
  comparisonOperatorReverse = new Map<string,string>();
  comparisonOperator: string;
  enableEnd: boolean;
  end: string;
  endValue: number;

  constructor(private localizationService: LocalizationService) { }

  ngOnInit(): void {
    this.init();
    Object.keys(ComparisonOperator).forEach(s => {
      const translatedOperator = this.localizationService.translate('comparison.' + s);
      this.comparisonOpearators.push(translatedOperator);
      this.comparisonOperatorReverse.set(translatedOperator, s);
    });
  }

  selectStart(item: RangeItem) {
    this.start = item.label;
    this.startValue = item.value;
    this.enableComparison = true;
  }

  selectComparisonOperator(operator: string) {
    this.comparisonOperator = operator;
    const comparisonOperatorValue = this.comparisonOperatorReverse.get(operator) as ComparisonOperator;
    if (comparisonOperatorValue !== ComparisonOperator.betweenInclusive) {
      this.selectedRange.emit(new FilterRange(this.startValue, comparisonOperatorValue, 0));
      this.init();
    } else {
      this.enableEnd = true;
    }
  }

  selectEnd(item: RangeItem) {
    this.end = item.label;
    this.endValue = item.value;
    const comparisonOperatorValue = this.comparisonOperatorReverse.get(this.comparisonOperator) as ComparisonOperator;
    this.selectedRange.emit(new FilterRange(this.startValue, comparisonOperatorValue, this.endValue));
    this.init();
  }

  private init() {
    this.start = this.localizationService.translate('common.select');
    this.comparisonOperator = this.localizationService.translate('common.select');
    this.end = this.localizationService.translate('common.select');
    this.enableComparison = false;
    this.enableEnd = false;
  }
}
