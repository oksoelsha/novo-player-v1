import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheatsComponent } from './cheats.component';

describe('CheatsComponent', () => {
  let component: CheatsComponent;
  let fixture: ComponentFixture<CheatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
