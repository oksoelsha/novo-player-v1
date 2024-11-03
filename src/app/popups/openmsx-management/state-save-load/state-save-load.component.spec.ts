import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateSaveLoadComponent } from './state-save-load.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Game } from '../../../models/game';

describe('StateSaveLoadComponent', () => {
  let component: StateSaveLoadComponent;
  let fixture: ComponentFixture<StateSaveLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ StateSaveLoadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StateSaveLoadComponent);
    component = fixture.componentInstance;
    component.events = of(true);
    const game = new Game('name', '1234', 2345);
    component.game = game;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
