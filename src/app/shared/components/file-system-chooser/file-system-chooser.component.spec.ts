import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSystemChooserComponent } from './file-system-chooser.component';
import { TranslateModule } from '@ngx-translate/core';

describe('FileSystemChooserComponent', () => {
  let component: FileSystemChooserComponent;
  let fixture: ComponentFixture<FileSystemChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ FileSystemChooserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSystemChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
