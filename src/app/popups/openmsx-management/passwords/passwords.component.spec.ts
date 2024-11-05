import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordsComponent } from './passwords.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { GamePasswordsInfo } from '../../../models/game-passwords-info';

describe('PasswordsComponent', () => {
  let component: PasswordsComponent;
  let fixture: ComponentFixture<PasswordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ PasswordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordsComponent);
    component = fixture.componentInstance;
    component.events = of(true);
    const gamePasswordsInfo = new GamePasswordsInfo([], 'setup')
    component.gamePasswordsInfo = gamePasswordsInfo;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
