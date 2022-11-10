import { TestBed } from '@angular/core/testing';

import { AdditionalExternalInfoService } from './additional-external-info.service';

describe('AdditionalExternalInfoService', () => {
  let service: AdditionalExternalInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdditionalExternalInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
