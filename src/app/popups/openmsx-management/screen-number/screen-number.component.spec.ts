import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenNumberComponent } from './screen-number.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('ScreenNumberComponent', () => {
  let component: ScreenNumberComponent;
  let fixture: ComponentFixture<ScreenNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ ScreenNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenNumberComponent);
    component = fixture.componentInstance;
    component.events = of(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
