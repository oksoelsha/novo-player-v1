import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FileSystemChooserComponent } from '../../shared/components/file-system-chooser/file-system-chooser.component';

import { ScanParametersComponent } from './scan-parameters.component';

describe('ScanParametersComponent', () => {
  let component: ScanParametersComponent;
  let fixture: ComponentFixture<ScanParametersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        ScanParametersComponent,
        FileSystemChooserComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
