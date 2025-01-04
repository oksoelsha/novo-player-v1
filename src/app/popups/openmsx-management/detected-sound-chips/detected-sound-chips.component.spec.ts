import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectedSoundChipsComponent } from './detected-sound-chips.component';

describe('DetectedSoundChipsComponent', () => {
  let component: DetectedSoundChipsComponent;
  let fixture: ComponentFixture<DetectedSoundChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetectedSoundChipsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectedSoundChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
