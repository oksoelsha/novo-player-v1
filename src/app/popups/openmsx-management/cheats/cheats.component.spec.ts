import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheatsComponent } from './cheats.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('CheatsComponent', () => {
  let component: CheatsComponent;
  let fixture: ComponentFixture<CheatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ CheatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheatsComponent);
    component = fixture.componentInstance;
    component.events = of(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
