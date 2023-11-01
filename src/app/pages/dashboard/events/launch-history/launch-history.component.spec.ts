import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchHistoryComponent } from './launch-history.component';

describe('LaunchHistoryComponent', () => {
  let component: LaunchHistoryComponent;
  let fixture: ComponentFixture<LaunchHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
