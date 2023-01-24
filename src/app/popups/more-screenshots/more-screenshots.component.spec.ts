import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreScreenshotsComponent } from './more-screenshots.component';

describe('MoreScreenshotsComponent', () => {
  let component: MoreScreenshotsComponent;
  let fixture: ComponentFixture<MoreScreenshotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreScreenshotsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreScreenshotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
