import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { EmuliciousArgumentsEditComponent } from './emulicious-arguments-edit.component';

describe('EmuliciousArgumentsEditComponent', () => {
  let component: EmuliciousArgumentsEditComponent;
  let fixture: ComponentFixture<EmuliciousArgumentsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ EmuliciousArgumentsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmuliciousArgumentsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
