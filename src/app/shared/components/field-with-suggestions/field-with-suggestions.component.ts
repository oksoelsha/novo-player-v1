import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-field-with-suggestions',
  templateUrl: './field-with-suggestions.component.html',
  styleUrls: ['./field-with-suggestions.component.sass']
})
export class FieldWithSuggestionsComponent {

  @Input() parentMenuOpen = false;
  @Input() value: string;
  @Input() suggestionsMap: Map<string, string[]>;
  @Input() trigger = '';
  @Output() userInputOutput = new EventEmitter<string>();
  @ViewChild('inputField') private inputField: ElementRef;
  @ViewChild('suggestionsDropdown', { static: true }) private suggestionsDropdown: NgbDropdown;
  @ViewChildren('suggestionsList') private suggestionsList: QueryList<ElementRef>;

  suggestions: string[] = [];
  private allPossibleSuggestions: string[] = [];

  constructor() { }

  showSuggestions(event: any) {
    this.showSuggestionsForGivenInput(event.target.value);
  }

  processArrowKey(event: KeyboardEvent) {
    if (this.suggestionsDropdown.isOpen() && event.key === 'ArrowDown') {
      this.suggestionsList.toArray()[0].nativeElement.focus();
    }
  }

  onSelectSuggestion(event: any, suggestion: string) {
    if (this.suggestionsDropdown.isOpen()) {
      const lastIndexTrigger = this.value.lastIndexOf(this.trigger);
      const lastIndexSpace = this.value.lastIndexOf(' ');
      const lastIndexTriggerOrSpace = this.getLastIndexTriggerOrSpace(lastIndexTrigger, lastIndexSpace);
      const valueToAppendTo = this.value.substring(0, lastIndexTriggerOrSpace + 1);

      if (suggestion.indexOf(' ') > -1) {
        this.value = valueToAppendTo + '"' + suggestion + '"';
      } else {
        this.value = valueToAppendTo + suggestion;
      }
      this.inputField.nativeElement.focus();
      this.suggestionsDropdown.close();
      this.allPossibleSuggestions = [];
      this.userInputOutput.emit(this.value);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  private showSuggestionsForGivenInput(inputText: string) {
    if (inputText) {
      const lastIndexTrigger = inputText.lastIndexOf(this.trigger);
      const lastIndexSpace = inputText.lastIndexOf(' ');
      if (lastIndexTrigger === inputText.length - 1) {
        this.allPossibleSuggestions = Array.from(this.suggestionsMap.keys());
        this.setSuggestionsList(inputText, lastIndexTrigger, -1);
      } else if (lastIndexTrigger > -1 && lastIndexSpace === inputText.length - 1) {
        const argument = inputText.substring(lastIndexTrigger + 1, lastIndexSpace);
        const values = this.suggestionsMap.get(argument);
        if (values != null) {
          this.allPossibleSuggestions = values;
          this.setSuggestionsList(inputText, lastIndexTrigger, lastIndexSpace);
        } else {
          this.suggestionsDropdown.close();
        }
      } else {
        this.setSuggestionsList(inputText, lastIndexTrigger, lastIndexSpace);
      }
    } else {
      this.suggestionsDropdown.close();
    }
    this.userInputOutput.emit(this.value);
  }

  private setSuggestionsList(inputText: string, lastIndexTrigger: number, lastIndexSpace: number) {
    const lastIndexTriggerOrSpace = this.getLastIndexTriggerOrSpace(lastIndexTrigger, lastIndexSpace);

    if (inputText.length - 1 > lastIndexTriggerOrSpace) {
      const inputTextPortion = inputText.substring(lastIndexTriggerOrSpace + 1);
      this.suggestions = this.allPossibleSuggestions.filter(s => s.startsWith(inputTextPortion));
    } else {
      this.suggestions = this.allPossibleSuggestions;
    }

    this.suggestionsDropdown.open();
  }

  private getLastIndexTriggerOrSpace(lastIndexTrigger: number, lastIndexSpace: number): number {
    if (lastIndexTrigger > lastIndexSpace) {
      return lastIndexTrigger;
    } else {
      return lastIndexSpace;
    }
  }
}
