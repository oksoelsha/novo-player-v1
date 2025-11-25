import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveLoadComponent } from './save-load.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

describe('SaveLoadComponent', () => {
  let component: SaveLoadComponent;
  let fixture: ComponentFixture<SaveLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [
        SaveLoadComponent,
        NgbDropdown
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
