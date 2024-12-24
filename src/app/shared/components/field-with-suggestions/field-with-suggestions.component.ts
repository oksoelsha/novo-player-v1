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
        if (lastIndexTrigger === 0 || inputText.charAt(lastIndexTrigger - 1) === ' ') {
          const allPossibleSuggestions = Array.from(this.suggestionsMap.keys());
          this.setSuggestionsList(null, allPossibleSuggestions);            
        } else {
          this.suggestionsDropdown.close();
        }
      } else if (lastIndexTrigger > -1 && lastIndexSpace === inputText.length - 1 &&
          inputText.indexOf(' ', lastIndexTrigger) === lastIndexSpace) {
        // we typed the complete command
        const argument = inputText.substring(lastIndexTrigger + 1, lastIndexSpace);
        const values = this.suggestionsMap.get(argument);
        if (values != null) {
          const allPossibleSuggestions = values;
          this.setSuggestionsList(null, allPossibleSuggestions);
        } else {
          this.suggestionsDropdown.close();
        }
      } else {
        let textToMatch: string;
        let allPossibleSuggestions: string[];
        if (inputText.length - 1 > lastIndexSpace && lastIndexSpace > lastIndexTrigger) {
          // we're inside the argument value
          const argument = inputText.substring(lastIndexTrigger + 1, lastIndexSpace);
          allPossibleSuggestions = this.suggestionsMap.get(argument);
          textToMatch = inputText.substring(lastIndexSpace + 1);
        } else {
          // we're inside the argument
          allPossibleSuggestions = Array.from(this.suggestionsMap.keys());
          textToMatch = inputText.substring(lastIndexTrigger + 1);
        }
        this.setSuggestionsList(textToMatch, allPossibleSuggestions);
      }
    } else {
      this.suggestionsDropdown.close();
    }
    this.userInputOutput.emit(this.value);
  }

  private setSuggestionsList(textToMatch: string, allPossibleSuggestions: string[]) {
    if (textToMatch) {
      this.suggestions = allPossibleSuggestions.filter(s => s.toLowerCase().startsWith(textToMatch.toLowerCase()));
    } else {
      this.suggestions = allPossibleSuggestions;
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
