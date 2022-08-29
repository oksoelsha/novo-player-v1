import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { WebmsxMachineSetComponent } from './webmsx-machine-set.component';

describe('WebmsxMachineSetComponent', () => {
  let component: WebmsxMachineSetComponent;
  let fixture: ComponentFixture<WebmsxMachineSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ WebmsxMachineSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebmsxMachineSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
