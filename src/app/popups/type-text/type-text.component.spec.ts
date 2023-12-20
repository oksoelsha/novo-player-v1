import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeTextComponent } from './type-text.component';
import { TranslateModule } from '@ngx-translate/core';

describe('TypeTextComponent', () => {
  let component: TypeTextComponent;
  let fixture: ComponentFixture<TypeTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ TypeTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
