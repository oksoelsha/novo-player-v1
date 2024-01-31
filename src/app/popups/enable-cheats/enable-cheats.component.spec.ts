import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableCheatsComponent } from './enable-cheats.component';
import { TranslateModule } from '@ngx-translate/core';

describe('EnableCheatsComponent', () => {
  let component: EnableCheatsComponent;
  let fixture: ComponentFixture<EnableCheatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ EnableCheatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableCheatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
