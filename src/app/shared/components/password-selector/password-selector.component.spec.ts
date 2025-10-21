import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordSelectorComponent } from './password-selector.component';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { GamePasswordsInfo } from '../../../models/game-passwords-info';

describe('PasswordSelectorComponent', () => {
  let component: PasswordSelectorComponent;
  let fixture: ComponentFixture<PasswordSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [
        PasswordSelectorComponent,
        NgbDropdown
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordSelectorComponent);
    component = fixture.componentInstance;
    component.gamePasswordsInfo = new GamePasswordsInfo([], 'setup', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
