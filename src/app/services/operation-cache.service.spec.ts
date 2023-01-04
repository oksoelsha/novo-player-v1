import { TestBed } from '@angular/core/testing';

import { OperationCacheService } from './operation-cache.service';

describe('OperationCacheService', () => {
  let service: OperationCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
