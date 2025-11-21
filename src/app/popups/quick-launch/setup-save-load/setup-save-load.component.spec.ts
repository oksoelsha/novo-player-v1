import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupSaveLoadComponent } from './setup-save-load.component';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

describe('SetupSaveLoadComponent', () => {
  let component: SetupSaveLoadComponent;
  let fixture: ComponentFixture<SetupSaveLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [
        SetupSaveLoadComponent,
        NgbDropdown
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupSaveLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
