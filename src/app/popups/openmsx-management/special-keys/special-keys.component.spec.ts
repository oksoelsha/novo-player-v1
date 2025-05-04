import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialKeysComponent } from './special-keys.component';
import { TranslateModule } from '@ngx-translate/core';

describe('SpecialKeysComponent', () => {
  let component: SpecialKeysComponent;
  let fixture: ComponentFixture<SpecialKeysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ SpecialKeysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
