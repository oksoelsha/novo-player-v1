import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchCountComponent } from './launch-count.component';
import { TranslateModule } from '@ngx-translate/core';

describe('LaunchCountComponent', () => {
  let component: LaunchCountComponent;
  let fixture: ComponentFixture<LaunchCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ LaunchCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
