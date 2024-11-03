import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextTypingComponent } from './text-typing.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('TextTypingComponent', () => {
  let component: TextTypingComponent;
  let fixture: ComponentFixture<TextTypingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ TextTypingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextTypingComponent);
    component = fixture.componentInstance;
    component.events = of(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
