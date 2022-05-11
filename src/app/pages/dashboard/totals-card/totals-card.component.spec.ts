import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Totals } from '../../../models/totals';

import { TotalsCardComponent } from './totals-card.component';

describe('TotalsCardComponent', () => {
  let component: TotalsCardComponent;
  let fixture: ComponentFixture<TotalsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ TotalsCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalsCardComponent);
    component = fixture.componentInstance;
    component.totalsEvent = new Observable<Totals>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
