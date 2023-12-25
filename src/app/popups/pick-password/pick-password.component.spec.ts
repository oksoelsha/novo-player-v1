import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickPasswordComponent } from './pick-password.component';

describe('PickPasswordComponent', () => {
  let component: PickPasswordComponent;
  let fixture: ComponentFixture<PickPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
