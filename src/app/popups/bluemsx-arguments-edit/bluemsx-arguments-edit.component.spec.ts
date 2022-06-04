import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BluemsxArgumentsEditComponent } from './bluemsx-arguments-edit.component';

describe('BluemsxArgumentsEditComponent', () => {
  let component: BluemsxArgumentsEditComponent;
  let fixture: ComponentFixture<BluemsxArgumentsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BluemsxArgumentsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BluemsxArgumentsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
