import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenNumberComponent } from './screen-number.component';

describe('ScreenNumberComponent', () => {
  let component: ScreenNumberComponent;
  let fixture: ComponentFixture<ScreenNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreenNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
