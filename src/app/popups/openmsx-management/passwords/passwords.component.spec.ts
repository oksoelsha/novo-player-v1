import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordsComponent } from './passwords.component';
import { TranslateModule } from '@ngx-translate/core';
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
    const gamePasswordsInfo = new GamePasswordsInfo([], 'setup', true);
    component.gamePasswordsInfo = gamePasswordsInfo;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
