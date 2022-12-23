import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionMatchIndicatorComponent } from './version-match-indicator.component';

describe('VersionMatchIndicatorComponent', () => {
  let component: VersionMatchIndicatorComponent;
  let fixture: ComponentFixture<VersionMatchIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VersionMatchIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionMatchIndicatorComponent);
    component = fixture.componentInstance;
    component.versions = Promise.resolve('dummy');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
