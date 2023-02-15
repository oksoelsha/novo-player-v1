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
  @Input() suggestions: string[] = [];
  @Input() trigger = '';
  @Output() userInputOutput = new EventEmitter<string>();
  @ViewChild('inputField') private inputField: ElementRef;
  @ViewChild('suggestionsDropdown', { static: true }) private suggestionsDropdown: NgbDropdown;
  @ViewChildren('suggestionsList') private suggestionsList: QueryList<ElementRef>;

  constructor() { }

  showSuggestions(event: any) {
    const inputText: string = event.target.value;
    if (inputText && inputText.lastIndexOf(this.trigger) === inputText.length - 1) {
      this.suggestionsDropdown.open();
    } else {
      this.suggestionsDropdown.close();
    }
    this.userInputOutput.emit(this.value);
  }

  processArrowKey(event: KeyboardEvent) {
    if (this.suggestionsDropdown.isOpen() && event.key === 'ArrowDown') {
      this.suggestionsList.toArray()[0].nativeElement.focus();
    }
  }

  onSelectSuggestion(event: any, suggestion: string) {
    this.value = this.value + suggestion + ' ';
    this.inputField.nativeElement.focus();
    this.userInputOutput.emit(this.value);    
    event.preventDefault();
    event.stopPropagation();
  }
}
