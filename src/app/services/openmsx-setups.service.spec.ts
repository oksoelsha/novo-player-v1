import { TestBed } from '@angular/core/testing';

import { OpenmsxSetupsService } from './openmsx-setups.service';

describe('OpenmsxSetupsService', () => {
  let service: OpenmsxSetupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenmsxSetupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
