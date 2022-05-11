import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgToggleModule } from '@nth-cloud/ng-toggle';

import { HardwareEditComponent } from './hardware-edit.component';

describe('HardwareEditComponent', () => {
  let component: HardwareEditComponent;
  let fixture: ComponentFixture<HardwareEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgToggleModule,
        TranslateModule.forRoot()
      ],
      declarations: [ HardwareEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HardwareEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
