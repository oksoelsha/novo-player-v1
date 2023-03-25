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
      if (suggestion.indexOf(' ') > -1) {
        this.value = this.value + '"' + suggestion + '"';
      } else {
        this.value = this.value + suggestion;
      }
      this.inputField.nativeElement.focus();
      setTimeout(() => {
        this.showSuggestionsForGivenInput(this.value);
      }, 0);
      this.userInputOutput.emit(this.value);  
    }
    event.preventDefault();
    event.stopPropagation();
  }

  private showSuggestionsForGivenInput(inputText: string) {
    if (inputText) {
      if (inputText.lastIndexOf(this.trigger) === inputText.length - 1) {
        this.suggestions = Array.from( this.suggestionsMap.keys() );
        this.suggestionsDropdown.open();
      } else {
        const lastIndexTrigger = inputText.lastIndexOf(this.trigger);
        const lastIndexSpace = inputText.lastIndexOf(' ');
        if (lastIndexTrigger > -1 && lastIndexSpace === inputText.length - 1) {
          const argument = inputText.substring(lastIndexTrigger + 1, lastIndexSpace);
          const values = this.suggestionsMap.get(argument);
          if (values != null) {
            this.suggestions = values;
            this.suggestionsDropdown.open();
          } else {
            this.suggestionsDropdown.close();
          }
        } else {
          this.suggestionsDropdown.close();
        }
      }
    } else {
      this.suggestionsDropdown.close();
    }
    this.userInputOutput.emit(this.value);
  }
}
