import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedGamesComponent } from './related-games.component';

describe('RelatedGamesComponent', () => {
  let component: RelatedGamesComponent;
  let fixture: ComponentFixture<RelatedGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatedGamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
