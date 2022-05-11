import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { DropDownWithInputComponent } from './drop-down-with-input.component';

describe('DropDownWithInputComponent', () => {
  let component: DropDownWithInputComponent;
  let fixture: ComponentFixture<DropDownWithInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [
        DropDownWithInputComponent,
        NgbDropdown
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropDownWithInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
