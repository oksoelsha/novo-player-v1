import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAdditionsComponent } from './new-additions.component';
import { TranslateModule } from '@ngx-translate/core';

describe('NewAdditionsComponent', () => {
  let component: NewAdditionsComponent;
  let fixture: ComponentFixture<NewAdditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ NewAdditionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAdditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
