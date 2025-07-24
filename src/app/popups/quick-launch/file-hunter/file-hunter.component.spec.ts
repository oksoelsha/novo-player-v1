import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileHunterComponent } from './file-hunter.component';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

describe('FileHunterComponent', () => {
  let component: FileHunterComponent;
  let fixture: ComponentFixture<FileHunterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [
        FileHunterComponent,
        NgbDropdown
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileHunterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
