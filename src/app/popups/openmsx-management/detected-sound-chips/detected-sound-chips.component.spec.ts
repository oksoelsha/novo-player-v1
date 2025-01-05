import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectedSoundChipsComponent } from './detected-sound-chips.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('DetectedSoundChipsComponent', () => {
  let component: DetectedSoundChipsComponent;
  let fixture: ComponentFixture<DetectedSoundChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ DetectedSoundChipsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectedSoundChipsComponent);
    component = fixture.componentInstance;
    component.events = of(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
