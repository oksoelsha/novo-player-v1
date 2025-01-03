import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmulationSpeedComponent } from './emulation-speed.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('EmulationSpeedComponent', () => {
  let component: EmulationSpeedComponent;
  let fixture: ComponentFixture<EmulationSpeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ EmulationSpeedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmulationSpeedComponent);
    component = fixture.componentInstance;
    component.events = of(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
