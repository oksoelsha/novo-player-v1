import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmulationSpeedComponent } from './emulation-speed.component';

describe('EmulationSpeedComponent', () => {
  let component: EmulationSpeedComponent;
  let fixture: ComponentFixture<EmulationSpeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmulationSpeedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmulationSpeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
