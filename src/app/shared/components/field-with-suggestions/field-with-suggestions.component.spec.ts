import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

import { FieldWithSuggestionsComponent } from './field-with-suggestions.component';

describe('FieldWithSuggestionsComponent', () => {
  let component: FieldWithSuggestionsComponent;
  let fixture: ComponentFixture<FieldWithSuggestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FieldWithSuggestionsComponent,
        NgbDropdown
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldWithSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
