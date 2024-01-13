import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenmsxManagementComponent } from './openmsx-management.component';
import { TranslateModule } from '@ngx-translate/core';

describe('OpenmsxManagementComponent', () => {
  let component: OpenmsxManagementComponent;
  let fixture: ComponentFixture<OpenmsxManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ OpenmsxManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenmsxManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
