import { OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ContextMenuService } from '@perfectmemory/ngx-contextmenu';
import { ScanParametersComponent } from '../../popups/scan-parameters/scan-parameters.component';
import { FileSystemChooserComponent } from '../../shared/components/file-system-chooser/file-system-chooser.component';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        OverlayModule,
        TranslateModule.forRoot(),
      ],
      declarations: [
        HomeComponent,
        ScanParametersComponent,
        FileSystemChooserComponent,
        NgbDropdown
      ],
      providers: [
        ContextMenuService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', waitForAsync(inject([ContextMenuService], (contextMenuService: ContextMenuService) => {
    expect(component).toBeTruthy();
  })));
});
