import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalExternalInfoComponent } from './additional-external-info.component';

describe('AdditionalExternalInfoComponent', () => {
  let component: AdditionalExternalInfoComponent;
  let fixture: ComponentFixture<AdditionalExternalInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalExternalInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalExternalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
