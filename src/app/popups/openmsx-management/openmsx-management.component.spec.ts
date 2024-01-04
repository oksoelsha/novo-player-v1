import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenmsxManagementComponent } from './openmsx-management.component';

describe('OpenmsxManagementComponent', () => {
  let component: OpenmsxManagementComponent;
  let fixture: ComponentFixture<OpenmsxManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenmsxManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenmsxManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
