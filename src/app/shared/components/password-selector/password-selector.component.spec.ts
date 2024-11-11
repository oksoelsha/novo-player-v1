import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordSelectorComponent } from './password-selector.component';

describe('PasswordSelectorComponent', () => {
  let component: PasswordSelectorComponent;
  let fixture: ComponentFixture<PasswordSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
